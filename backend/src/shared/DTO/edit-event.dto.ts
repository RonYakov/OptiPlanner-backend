import {EventPriorityEnum} from "../enum/event-priority.enum";
import {RepeatTypeEnum} from "../enum/repeat-type.enum";
import {EventCategoryEnum} from "../enum/event-category.enum";
import {EventAlarm} from "../classes/event-alarm";

export class EditAbsoluteEventDto {
    id: number;
    user_id: number;
    name: string;
    priority: EventPriorityEnum;
    flexible: boolean = false;
    start_date: Date;
    end_date: Date;
    whole_day: boolean;
    start_time: Date;
    end_time: Date;
    repeat: boolean;
    repeat_type: RepeatTypeEnum;
    repeat_interval: number;
    location: string;
    category: EventCategoryEnum;
    description: string;
    alarms?: EventAlarm[];
    from_flexible_date?: Date;
    until_flexible_date?: Date;
    from_flexible_time?: Date;
    until_flexible_time?: Date;
    flexible_event_id?: number;
}