import { Body, Controller, Get, Post } from "@nestjs/common";
import {StatisticsService} from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    @Get('/getCurrentMonthEvents')
    async signUp(@Body() userId: string){
        return await this.statisticsService.getCurrentMonthEvents(userId);
    }

}
