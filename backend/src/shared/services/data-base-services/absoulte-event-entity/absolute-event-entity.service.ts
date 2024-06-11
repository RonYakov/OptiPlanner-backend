import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../../../entities/user.entity";
import {Repository} from "typeorm";
import {AbsoluteEvent} from "../../../entities/absolute-event.entity";
import {EventCategoryEnum} from "../../../enum/event-category.enum";

@Injectable()
export class AbsoluteEventEntityService {
    constructor(
        @InjectRepository(AbsoluteEvent)
        private absoluteEventRepository: Repository<AbsoluteEvent>,
    ) {}

    async createAbsoluteEvent(absoluteEvent: AbsoluteEvent){
        const newAbsoluteEvent = this.absoluteEventRepository.create(absoluteEvent);
        return this.absoluteEventRepository.save(newAbsoluteEvent);
    }

    async getUserEvents(userId: number){
        return this.absoluteEventRepository.findBy({user_id: userId});
    }

    async getUserEventById(eventId: number){
        return this.absoluteEventRepository.findOneBy({id: eventId});
    }

    async editEvent(eventId: number, absoluteEvent: AbsoluteEvent){
        const event = await this.absoluteEventRepository.findOneBy({id: eventId});
        event.name = absoluteEvent.name;
        event.priority = absoluteEvent.priority;
        event.flexible = absoluteEvent.flexible;
        event.start_date = absoluteEvent.start_date;
        event.end_date = absoluteEvent.end_date;
        event.whole_day = absoluteEvent.whole_day;
        event.start_time = absoluteEvent.start_time;
        event.end_time = absoluteEvent.end_time;
        event.repeat = absoluteEvent.repeat;
        event.repeat_type = absoluteEvent.repeat_type;
        event.repeat_interval = absoluteEvent.repeat_interval;
        event.location = absoluteEvent.location;
        event.category = absoluteEvent.category;
        event.description = absoluteEvent.description;
        event.alarms = absoluteEvent.alarms;

        return this.absoluteEventRepository.save(event);
    }

    async deleteEvent(eventId: number){
        return this.absoluteEventRepository.delete({id: eventId});
    }

    async getEvents(){
        return this.absoluteEventRepository.find();
    }

    async getEventByDate(date: Date){
        return this.absoluteEventRepository.findBy({start_date: date});
    }

    async getEventByCategory(category: EventCategoryEnum){
        return this.absoluteEventRepository.findBy({category: category});
    }
}
