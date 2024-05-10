import { Injectable } from '@nestjs/common';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
import { environment } from "../shared/environment/environment";
import { Amplify } from "aws-amplify";
import { signIn, signOut, signUp, confirmSignUp, updateUserAttributes, resetPassword } from 'aws-amplify/auth';
import {ConfirmationUserDto} from "../shared/DTO/confirmation-user.dto";
import {LoginUserDto} from "../shared/DTO/login-user.dto";

@Injectable()
export class AuthService {

  constructor() {
    Amplify.configure({
      Auth: {Cognito:environment.Cognito}
    })
  }

  async signIn(user: LoginUserDto) {
    try {
      const res = await signIn({
        username: user.email,
        password: user.password
      });
      return {status: 200, data: "Login successfully!"}; // Return the result from AuthService
    } catch (error) {
      if(error.name === 'UserAlreadyAuthenticatedException'){
        return {status: 4001, data: "There is already a signed in user"}
      }
      else if(error.name === 'NotAuthorizedException'){
        return {status: 4001, data: "Incorrect email or password"}
      }
      else if(error.name === 'EmptySignInUserName'){
        return {status: 4001, data: "Email or password cannot be empty"}
      }
    }
  }

  async signUp(user: CreateUserDto){
    try {
      const res = await signUp({
        username: user.email,
        password: user.password,
        options: {
          userAttributes: { name: user.name }
        }});

      return {status: 200, data: "Register successfully! please check your mail box!"}; // Return the result from AuthService
    } catch (error) {
      if(error.name === 'UsernameExistsException'){
        return {status: 4001, data: "User with this mail already exist!"}
      } else if (error.name === 'InvalidParameterException') {
        return {status: 4001, data: "Invalid mail!"}
      } else if (error.name === 'InvalidPasswordException') {
        return {status: 4001, data: "Invalid password!"}
      }
      return error;
    }
  }

  async confirmRegister(confirmationData: ConfirmationUserDto){
    try {
      const res = await confirmSignUp({
        username: confirmationData.email,
        confirmationCode: confirmationData.confirmationCode
      });

      return {status: 200, data: "Confirmation successfully!"};
    } catch (error) {
      if(error.name === 'ExpiredCodeException'){
        return {status: 4001, data: " Invalid code provided, please check your mail and code and request a code again."}
      } else if (error.name === 'LimitExceededException'){
        return {status: 4001, data: " Attempt limit exceeded, please try after some time."}
      } else if (error.name === 'CodeMismatchException'){
        return {status: 4001, data: " Invalid verification code provided, please try again."}
      }
    }
  }
}
