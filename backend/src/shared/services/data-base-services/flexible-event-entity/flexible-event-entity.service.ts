import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual, Repository} from "typeorm";
import {EventCategoryEnum} from "../../../enum/event-category.enum";
import {EventPriorityEnum} from "../../../enum/event-priority.enum";
import {FlexibleEvent} from "../../../entities/flexible-event.entity";


export class FlexibleEventEntity{
    id?: number;
    user_id: number;
    name: string;
    priority: EventPriorityEnum;
    flexible: boolean = true;
    optimal_start_date: Date;
    optimal_end_date: Date;
    from_date: Date;
    until_date: Date;
    whole_day: boolean;
    optimal_start_time: Date;
    optimal_end_time: Date;
    from_time: Date;
    until_time: Date;
    location: string;
    category: EventCategoryEnum;
    description: string;
}

@Injectable()
export class FlexibleEventEntityService {
    constructor(
        @InjectRepository(FlexibleEvent)
        private flexibleEventRepository: Repository<FlexibleEvent>,
    ) {}

    async createAbsoluteEvent(flexibleEventEntity: FlexibleEventEntity){
        const categoryValue = typeof flexibleEventEntity.category === 'string'
                ? EventCategoryEnum[flexibleEventEntity.category as keyof typeof EventCategoryEnum] : flexibleEventEntity.category;
        let newFlexibleEvent:any;
        newFlexibleEvent = this.flexibleEventRepository.create(
            {
                user_id: flexibleEventEntity.user_id,
                name: flexibleEventEntity.name,
                priority: flexibleEventEntity.priority,
                flexible: flexibleEventEntity.flexible,
                optimal_start_date: flexibleEventEntity.optimal_start_date,
                optimal_end_date: flexibleEventEntity.optimal_end_date,
                from_date: flexibleEventEntity.from_date,
                until_date: flexibleEventEntity.until_date,
                whole_day: flexibleEventEntity.whole_day,
                optimal_start_time: flexibleEventEntity.optimal_start_time,
                optimal_end_time: flexibleEventEntity.optimal_end_time,
                from_time: flexibleEventEntity.from_time,
                until_time: flexibleEventEntity.until_time,
                location: flexibleEventEntity.location,
                category: categoryValue,
                description: flexibleEventEntity.description,
            }
        );
        return this.flexibleEventRepository.save(newFlexibleEvent);
    }

    async getUserFlexibleEvents(userId: number){
        return this.flexibleEventRepository.findBy({user_id: userId});
    }

    async getUserEventById(eventId: number){
        return this.flexibleEventRepository.findOneBy({id: eventId});
    }

    async editFlexibleEvent(flexibleEvent: FlexibleEventEntity){
        const event = await this.flexibleEventRepository.findOneBy({id: flexibleEvent.id});
        event.name = flexibleEvent.name;
        event.priority = flexibleEvent.priority;
        event.flexible = flexibleEvent.flexible;
        event.optimal_start_date = flexibleEvent.optimal_start_date;
        event.optimal_end_date = flexibleEvent.optimal_end_date;
        event.from_date = flexibleEvent.from_date;
        event.until_date = flexibleEvent.until_date;
        event.whole_day = flexibleEvent.whole_day;
        event.optimal_start_time = flexibleEvent.optimal_start_time;
        event.optimal_end_time = flexibleEvent.optimal_end_time;
        event.from_time = flexibleEvent.from_time;
        event.until_time = flexibleEvent.until_time;
        event.location = flexibleEvent.location;
        event.category = flexibleEvent.category;
        event.description = flexibleEvent.description;

        return this.flexibleEventRepository.save(event);
    }

    async deleteFlexibleEvent(eventId: number){
        return this.flexibleEventRepository.delete({id: eventId});
    }

    async getFlexibleEvents(){
        return this.flexibleEventRepository.find();
    }

    async getFlexibleEventByDate(date: Date){
        return this.flexibleEventRepository.findBy({optimal_start_date: date});
    }

    async getFlexibleEventsByDateRange(userId: number,from: Date, to: Date) {
        if(from.getDay() == to.getDay() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear()) {
            return this.flexibleEventRepository.find({
                where: {
                    user_id: userId,
                    optimal_start_date: from
                }
            });
        }
        else{
            return this.flexibleEventRepository.find({
                where: {
                    user_id: userId,
                    optimal_start_date: MoreThanOrEqual(from),
                    optimal_end_date: LessThanOrEqual(to)
                }
            });
        }
    }

    async getFlexibleEventByCategory(category: EventCategoryEnum){
        return this.flexibleEventRepository.findBy({category: category});
    }
}
