import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';
import {EventPriorityEnum} from "../enum/event-priority.enum";
import {RepeatTypeEnum} from "../enum/repeat-type.enum";
import {EventCategoryEnum} from "../enum/event-category.enum";
import {EventAlarm} from "../classes/event-alarm";

@Entity('flexible-events')
export class FlexibleEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    name: string;

    @Column()
    priority: EventPriorityEnum;

    @Column()
    flexible: boolean = false;

    @Column()
    from_date: Date;

    @Column()
    until_date: Date;

    @Column()
    whole_day: boolean;

    @Column()
    from_time: Date;

    @Column()
    until_time: Date;

    @Column()
    total_time_needed: number; // in minutes

    @Column()
    repeat: boolean;

    @Column()
    repeat_type: RepeatTypeEnum;

    @Column({nullable:true})
    repeat_interval: number;

    @Column({nullable:true})
    location: string;

    @Column( {nullable:true})
    category: EventCategoryEnum;

    @Column({nullable:true})
    description: string;

    @Column({type: "json",nullable:true})
    alarms: EventAlarm[];
}
