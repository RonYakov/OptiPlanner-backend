import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
import { ConfirmationUserDto } from "../shared/DTO/confirmation-user.dto";

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

}
