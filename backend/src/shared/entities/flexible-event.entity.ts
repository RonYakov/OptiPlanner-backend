import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {EventPriorityEnum} from "../enum/event-priority.enum";
import {EventCategoryEnum} from "../enum/event-category.enum";

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
    flexible: boolean;

    @Column()
    optimal_start_date: Date;

    @Column()
    optimal_end_date: Date;

    @Column()
    from_date: Date;

    @Column()
    until_date: Date;

    @Column()
    whole_day: boolean;

    @Column()
    optimal_start_time: Date;

    @Column()
    optimal_end_time: Date;

    @Column()
    from_time: Date;

    @Column()
    until_time: Date;

    @Column({nullable:true})
    location: string;

    @Column( {nullable:true})
    category: EventCategoryEnum;

    @Column({nullable:true})
    description: string;
}
