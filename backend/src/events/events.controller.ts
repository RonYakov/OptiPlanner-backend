import {Body, Controller, Logger, Post, Get} from '@nestjs/common';
import { EventsService } from './events.service';
import {CreateEventDto} from "../shared/DTO/create-event.dto";
import {EditEventDto} from "../shared/DTO/edit-event.dto";

@Controller('events')
export class EventsController {
  constructor(private eventService: EventsService) {}

  @Post('/create-absolute-event')
  async createAbsoluteEvent(
      @Body() eventData: CreateEventDto
  ) {
    return await this.eventService.createEvent(eventData);
  }

  @Post('/edit-absolute-event')
  async editAbsoluteEvent(
      @Body() eventData: EditEventDto
  ) {
        return await this.eventService.editEvent(eventData);
    }


  @Post('place-event')
  async placeEvent(@Body() newEvent: CreateEventDto) {
    const result = await this.eventService.advancedPlacementHelper(newEvent, []);

    console.log('result: ', result);
    return result;
  }

}
