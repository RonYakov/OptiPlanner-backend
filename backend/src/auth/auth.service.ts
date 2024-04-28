import { Injectable } from '@nestjs/common';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
import { environment } from "../shared/environment/environment";
import { Amplify } from "aws-amplify";
import { signIn, signOut, signUp, confirmSignUp, updateUserAttributes } from 'aws-amplify/auth';

@Injectable()
export class AuthService {

  constructor() {
    Amplify.configure({
      Auth: {Cognito:environment.Cognito}
    })
  }

  async signUp(user: CreateUserDto){
    try {
      const res = await signUp({
        username: user.email,
        password: user.password,
        options: {
          userAttributes: { name: user.name }
        }
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}
