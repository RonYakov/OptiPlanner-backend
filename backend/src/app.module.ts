import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { CalendarController } from "./calendar/calendar.controller";
import { AuthService } from './auth/auth.service';
import { CalendarService } from "./calendar/calendar.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ormConfig} from "./shared/environment/orm.config";
import {TestService} from "./db-demo/Test.service";
import {Test} from "./shared/entities/test.entity";
import {FlexibleEvent} from "./shared/entities/flexible-event.entity";
import {AbsoluteEvent} from "./shared/entities/absolute-event.entity";
import {User} from "./shared/entities/user.entity";
import {UserEntityService} from "./shared/services/data-base-services/user-entity/user-entity.service";
import { AbsoluteEventEntityService } from "./shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";
import {EventsController} from "./events/events.controller";
import {EventsService} from "./events/events.service";
import { FlexibleEventEntityService } from "./shared/services/data-base-services/flexible-event-entity/flexible-event-entity.service";
import { StatisticsService } from './statistics/statistics.service';
import { StatisticsController } from './statistics/statistics.controller';



@Module({
  imports: [
    // CorsModule.forRoot({
    //   origin: 'http://localhost:4200', // Replace with your Angular app URL
    // }),
      TypeOrmModule.forRoot(ormConfig),
      TypeOrmModule.forFeature([Test, FlexibleEvent,AbsoluteEvent,User]),
  ],
  controllers: [AppController, AuthController, CalendarController, EventsController, StatisticsController],
  providers: [AppService, AuthService, CalendarService, TestService, UserEntityService, AbsoluteEventEntityService,FlexibleEventEntityService, EventsService, StatisticsService],
    exports: [TestService,UserEntityService,AbsoluteEventEntityService,FlexibleEventEntityService]
})
export class AppModule {}
