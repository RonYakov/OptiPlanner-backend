import { Body, Controller, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import {CreateAbsoluteEventDto} from "../shared/DTO/create-event.dto";
import {EditAbsoluteEventDto} from "../shared/DTO/edit-event.dto";

@Controller('events')
export class EventsController {
  constructor(private eventService: EventsService) {}

  @Post('/create-absolute-event')
  async createAbsoluteEvent(
      @Body() eventData: CreateAbsoluteEventDto
  ) {
    return await this.eventService.createEvent(eventData);
  }

  @Post('/edit-absolute-event')
  async editAbsoluteEvent(
      @Body() eventData: EditAbsoluteEventDto
  ) {
        return await this.eventService.editEvent(eventData);
    }

}
