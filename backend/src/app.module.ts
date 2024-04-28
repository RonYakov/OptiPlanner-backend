import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';


@Module({
  imports: [
    // CorsModule.forRoot({
    //   origin: 'http://localhost:4200', // Replace with your Angular app URL
    // }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
