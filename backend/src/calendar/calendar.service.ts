import {Injectable} from "@nestjs/common";
import {AbsoluteEventEntityService} from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";

@Injectable()
export class CalendarService {
    constructor(private absoluteEventEntityService: AbsoluteEventEntityService) {}

    async getUserEvents(userId: number){
        if (!userId) {
            console.log("User ID is undefined");
            return {status: 4002, data: "User ID is undefined"};
        }
        try {
            const events = await this.absoluteEventEntityService.getUserEvents(userId);
            //console.log("events send");
            return {status: 200, data: events};
        } catch (error) {
            console.log("events not send");
            return {status: 4001, data: "There was an error getting user events"};
        }
    }
}
