import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {environment} from "./shared/environment/environment";
import {ormConfig} from "./shared/environment/orm.config";
import {TestService} from "./db-demo/Test.service";
import {Test} from "./shared/entities/test.entity";


@Module({
  imports: [
    // CorsModule.forRoot({
    //   origin: 'http://localhost:4200', // Replace with your Angular app URL
    // }),
      TypeOrmModule.forRoot(ormConfig),
      TypeOrmModule.forFeature([Test,]),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService,TestService],
    exports: [TestService]
})
export class AppModule {}
