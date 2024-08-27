import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {StatisticsService} from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    @Get('/getCurrentMonthEvents')
    async getMonthEvents(@Query('userId') userId: string){
        return await this.statisticsService.getCurrentMonthEvents(parseInt(userId));
    }

    @Get('/getCurrentWeekEvents')
    async getWeekEvents(@Query('userId') userId: string){
        return await this.statisticsService.getCurrentWeekEvents(parseInt(userId));
    }

}
