import { Controller, Get, Query, Delete } from "@nestjs/common";
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
    constructor(private calendarService: CalendarService) {
    }

    @Get('/getUserEvents')
    async getUserEvents(@Query('userid') userId: string) {
        let events = await this.calendarService.getUserEvents(parseInt(userId));
        return events;
    }

    @Delete('/deleteEvent')
    async deleteEvent(@Query('eventId') eventId: string) {
        return await this.calendarService.deleteEvent(parseInt(eventId));
    }
}