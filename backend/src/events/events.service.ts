import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsoluteEvent } from '../shared/entities/absolute-event.entity';
import {CreateAbsoluteEventDto} from "../shared/DTO/create-event.dto";
import { AbsoluteEventEntityService } from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";
import {EditAbsoluteEventDto} from "../shared/DTO/edit-event.dto";
import {FlexibleEvent} from "../shared/entities/flexible-event.entity";

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(AbsoluteEvent)
        private readonly absoluteEventRepository: Repository<AbsoluteEvent>,
        @InjectRepository(FlexibleEvent)
        private readonly flexibleEventRepository: Repository<AbsoluteEvent>,
        private absoluteEventService: AbsoluteEventEntityService
    ) {}

    async createEvent(eventData: CreateAbsoluteEventDto){
        /*
        some logic:
        1. filtering which event are we working on
        2. going to the function/functions that determine if the event can be placed
         2.1 if yes , proceed
         2.2 if no , return error/message/code
         */
        console.log(eventData.user_id);
        return this.absoluteEventService.createAbsoluteEvent(eventData);
    }

    async editEvent(eventData: EditAbsoluteEventDto) {
        return this.absoluteEventService.editEvent(eventData);
    }


    /*
    1. repeated events function: creates repeated events list. ido
    2. basic placement function: checks if the event can be placed in the calendar. ido
    3. advanced placement function: checks if the event can be placed in the calendar with additional conditions
        3.1. this function calls the events in the date range of each event in the list
        3.2. checks for each event in the list if it can be placed
            3.2.1. if it is repeated, and one fails, return.
            3.2.2. else (not repeated) if it failed, return.
        3.3. makes changes as necessary
     */
}
