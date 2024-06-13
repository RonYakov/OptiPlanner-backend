import { Controller, Get, Query } from "@nestjs/common";
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
    constructor(private calendarService: CalendarService) {
    }

    @Get('/getUserEvents')
    async getUserEvents(@Query('userid') userId: string) {
        return await this.calendarService.getUserEvents(parseInt(userId));
    }
}