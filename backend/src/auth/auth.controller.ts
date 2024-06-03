import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
import { ConfirmationUserDto } from "../shared/DTO/confirmation-user.dto";
import {LoginUserDto} from "../shared/DTO/login-user.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() user: CreateUserDto){
      return await this.authService.signUp(user);
  }

  @Post('/confirm-register')
  async confirmRegister(@Body() confirmationData: ConfirmationUserDto) {
    return await this.authService.confirmRegister(confirmationData);
  }

  @Post('/login')
    async login(@Body() loginData: LoginUserDto) {
        return await this.authService.signIn(loginData);
    }

  @Post('/google-sign-up')
  async googleSignUp(@Body() userToken: { token: string }) {
    return await this.authService.googleSignUp(userToken);
  }

  @Post('/signOut')
  async signOut(){
    return await this.authService.signOut();
  }
}
