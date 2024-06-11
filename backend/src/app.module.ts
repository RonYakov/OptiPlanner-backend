import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ormConfig} from "./shared/environment/orm.config";
import {TestService} from "./db-demo/Test.service";
import {Test} from "./shared/entities/test.entity";
import {FlexibleEvent} from "./shared/entities/flexible-event.entity";
import {AbsoluteEvent} from "./shared/entities/absolute-event.entity";
import {User} from "./shared/entities/user.entity";
import {UserEntityService} from "./shared/services/data-base-services/user-entity/user-entity.service";
import {
    AbsoluteEventEntityService
} from "./shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";



@Module({
  imports: [
    // CorsModule.forRoot({
    //   origin: 'http://localhost:4200', // Replace with your Angular app URL
    // }),
      TypeOrmModule.forRoot(ormConfig),
      TypeOrmModule.forFeature([Test, FlexibleEvent,AbsoluteEvent,User]),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService,TestService,UserEntityService,AbsoluteEventEntityService],
    exports: [TestService,UserEntityService,AbsoluteEventEntityService]
})
export class AppModule {}
