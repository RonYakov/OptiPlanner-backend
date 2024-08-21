import {Injectable} from "@nestjs/common";
import {AbsoluteEventEntityService} from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";
import {FlexibleEventEntityService} from "../shared/services/data-base-services/flexible-event-entity/flexible-event-entity.service";
import {FlexibleEvent} from "../shared/entities/flexible-event.entity";
import {EditEventDto} from "../shared/DTO/edit-event.dto";

@Injectable()
export class CalendarService {
    constructor(private absoluteEventEntityService: AbsoluteEventEntityService,
                private flexibleEventEntityService: FlexibleEventEntityService) {}

    async getUserEvents(userId: number){
        if (!userId) {
            console.log("User ID is undefined");
            return {status: 4002, data: "User ID is undefined"};
        }
        try {
            const events : EditEventDto[] = await this.absoluteEventEntityService.getUserEvents(userId);
            const flexibleEvents = await this.flexibleEventEntityService.getUserFlexibleEvents(userId);
            for(let event of flexibleEvents){
                events.push(this.convertFlexibleEventToEditEvent(event));
            }
            return {status: 200, data: events};
        } catch (error) {
            console.log("events not send");
            return {status: 4001, data: "There was an error getting user events"};
        }
    }

    convertFlexibleEventToEditEvent(flexibleEventId: FlexibleEvent) {
        return {
            id: flexibleEventId.id,
            user_id: flexibleEventId.user_id,
            name: flexibleEventId.name,
            priority: flexibleEventId.priority,
            flexible: true,
            start_date: flexibleEventId.optimal_start_date,
            end_date: flexibleEventId.optimal_end_date,
            whole_day: flexibleEventId.whole_day,
            start_time: flexibleEventId.optimal_start_time,
            end_time: flexibleEventId.optimal_end_time,
            repeat: false,
            repeat_type: 0,
            repeat_interval: 0,
            location: flexibleEventId.location,
            category: flexibleEventId.category,
            description: flexibleEventId.description,
            alarms: [],
            flexible_event_id: flexibleEventId.id,
            from_flexible_date: flexibleEventId.from_date,
            until_flexible_date: flexibleEventId.until_date,
            from_flexible_time: flexibleEventId.from_time,
            until_flexible_time: flexibleEventId.until_time
        };
    }

    async deleteEvent(eventId: number){
        if (!eventId) {
            console.log("Event ID is undefined");
            return {status: 4002, data: "Event ID is undefined"};
        }
        try {
            let result1 = await this.absoluteEventEntityService.deleteEvent(eventId);
            let result2 = await this.flexibleEventEntityService.deleteFlexibleEvent(eventId);
            return {status: 200, data: {result1, result2}};
        } catch (error) {
            console.log("event not deleted");
            return {status: 4001, data: "There was an error deleting the event"};
        }
    }
}
