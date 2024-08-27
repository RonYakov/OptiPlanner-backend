import {Body, Controller, Logger, Post, Get} from '@nestjs/common';
import { EventsService , CreationFailedError} from './events.service';
import {CreateEventDto} from "../shared/DTO/create-event.dto";
import {EditEventDto} from "../shared/DTO/edit-event.dto";

@Controller('events')
export class EventsController {
  constructor(private eventService: EventsService) {}

  @Post('/create-absolute-event')
  async createAbsoluteEvent(
      @Body() eventData: CreateEventDto
  ) {
    try{
      await this.eventService.createEvent(eventData);
      return {status: 200};

    } catch (e) {
      if (e instanceof CreationFailedError) {
        return {status: 4001, object1: e.object1};
      }
    }
  }

  @Post('/edit-absolute-event')
  async editAbsoluteEvent(
      @Body() eventData: EditEventDto
  ) {
    try {
      await this.eventService.editEvent(eventData);
      return {status: 200};

    } catch (e) {
      if (e instanceof CreationFailedError) {
        return {status: 4001, object1: e.object1};
      }
    }
  }

  @Post('/edit-change-events')
  async editChangeEvents(
      @Body() eventData: EditEventDto, @Body() changeEvents: EditEventDto[]
  ) {
    try {
      await this.eventService.changeFlexibleEventsToAbsoluteEvents(changeEvents);
      return {status: 200};

    } catch (e) {
        return {status: 4001, object1: e.object1};
    }
  }

  @Post('/create-change-events')
  async createChangeEvents(
      @Body() eventData: CreateEventDto, @Body() changeEvents: EditEventDto[]
  ) {
    try{
      await this.eventService.changeFlexibleEventsToAbsoluteEvents(changeEvents);
      return {status: 200};

    } catch (e) {
        return {status: 4001, object1: e.object1};
    }
  }


  @Post('place-event')
  async placeEvent(@Body() newEvent: CreateEventDto) {
    const result = await this.eventService.advancedPlacementHelper(newEvent, []);

    console.log('result: ', result);
    return result;
  }
}
