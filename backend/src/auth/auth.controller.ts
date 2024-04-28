import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { CreateUserDto } from "../shared/DTO/create-user.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() user: CreateUserDto){

    try {
      const res = await this.authService.signUp(user);
      return {status: 200, data: "Register successfully! please check your mail box!"}; // Return the result from AuthService
    } catch (error) {//todo- take care for all errors
      if(error.name === 'UsernameExistsException'){
        return {status: 4001, data: "User with this mail already exist!"}
      }
      return error;
    }
  }

}
