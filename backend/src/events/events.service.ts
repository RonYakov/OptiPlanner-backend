import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsoluteEvent } from '../shared/entities/absolute-event.entity';
import {CreateAbsoluteEventDto} from "../shared/DTO/create-event.dto";
import { AbsoluteEventEntityService } from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";
import {EditAbsoluteEventDto} from "../shared/DTO/edit-event.dto";

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(AbsoluteEvent)
        private readonly eventRepository: Repository<AbsoluteEvent>,
        private absoluteEventService: AbsoluteEventEntityService
    ) {}

    async createEvent(eventData: CreateAbsoluteEventDto){
        console.log(eventData.user_id);
        return this.absoluteEventService.createAbsoluteEvent(eventData);
    }

    async editEvent(eventData: EditAbsoluteEventDto) {
        return this.absoluteEventService.editEvent(eventData);
    }
}
