import { Injectable } from '@nestjs/common';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
import { environment } from "../shared/environment/environment";
import { Amplify } from "aws-amplify";
import { signIn, signOut, signUp, confirmSignUp, updateUserAttributes, resetPassword, fetchUserAttributes } from 'aws-amplify/auth';
import {ConfirmationUserDto} from "../shared/DTO/confirmation-user.dto";
import {LoginUserDto} from "../shared/DTO/login-user.dto";
import { OAuth2Client } from 'google-auth-library';
import {UserEntityService} from "../shared/services/data-base-services/user-entity/user-entity.service";

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  constructor(
    private userEntityService: UserEntityService
  ) {
    Amplify.configure({
      Auth: {Cognito: environment.Cognito}
    })
    this.googleClient = new OAuth2Client('756316002330-vqdsffqig8drfgs8iitafeirkah5opii.apps.googleusercontent.com');
  }

  async signIn(user: LoginUserDto) {
    try {
      const res = await signIn({
        username: user.email,
        password: user.password
      });

      const attributes = await fetchUserAttributes();
      const userFromDb = await this.userEntityService.getUserByEmail(user.email);
      return {status: 200, data: { name: attributes.name, id: userFromDb.id }};
    } catch (error) {
      if (error.name === 'UserAlreadyAuthenticatedException') {
        return {status: 4001, data: "There is already a signed in user"}
      } else if (error.name === 'NotAuthorizedException') {
        return {status: 4001, data: "Incorrect email or password"}
      } else if (error.name === 'EmptySignInUserName') {
        return {status: 4001, data: "Email or password cannot be empty"}
      }
    }
  }

  async signUp(user: CreateUserDto) {
    try {
      const res = await signUp({
        username: user.email,
        password: user.password,
        options: {
          userAttributes: {name: user.name}
        }
      });

      this.userEntityService.createUser(user.name, user.email, []);
      return {status: 200, data: "Register successfully! please check your mail box!"};
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        return {status: 4001, data: "User with this mail already exist!"}
      } else if (error.name === 'InvalidParameterException') {
        return {status: 4001, data: "Invalid mail!"}
      } else if (error.name === 'InvalidPasswordException') {
        return {status: 4001, data: "Invalid password!"}
      }
      return error;
    }
  }

  async confirmRegister(confirmationData: ConfirmationUserDto) {
    try {
      const res = await confirmSignUp({
        username: confirmationData.email,
        confirmationCode: confirmationData.confirmationCode
      });

      return {status: 200, data: "Confirmation successfully!"};
    } catch (error) {
      if (error.name === 'ExpiredCodeException') {
        return {status: 4001, data: " Invalid code provided, please check your mail and code and request a code again."}
      } else if (error.name === 'LimitExceededException') {
        return {status: 4001, data: " Attempt limit exceeded, please try after some time."}
      } else if (error.name === 'CodeMismatchException') {
        return {status: 4001, data: " Invalid verification code provided, please try again."}
      }
    }
  }

  async googleSignUp(userTokenObj: { token: string }) {
    try {
      const userToken: string = userTokenObj.token;
      console.log(userToken)
      // Verify the token with Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: userToken,
        audience: '756316002330-vqdsffqig8drfgs8iitafeirkah5opii.apps.googleusercontent.com'
      });

      const payload = ticket.getPayload();

      // Extract user information from the payload
      const email = payload.email;
      const name = payload.name; // Or any other user info you want to extract

      // Sign up the user in Cognito
      const res = await signUp({
        username: email,
        password: 'DummyPassword123!', // You can generate a random password here
        options: {
          userAttributes: { name }
        }
      });

      return { status: 200, data: "Sign up successful!" };
    } catch (error) {
      // Handle errors
      console.error('Google sign up error:', error);
      return { status: 4001, data: "Google sign up failed." };
    }
  }

  async signOut() {
    try {
      await signOut();
      return { status: 200, data: "Sign out successful!" };
    } catch (error) {
      return { status: 4001, data: "Sign out failed." };
    }
  }
}
