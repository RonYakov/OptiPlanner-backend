import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {EventCategoryEnum} from "../enum/event-category.enum";
import {AbsoluteEvent} from "./absolute-event.entity";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({type: "json",nullable:true})
    user_categories: EventCategoryEnum[];

    @Column({type: "json",nullable:true})
    events: AbsoluteEvent[];

    // @Column({type: "json",nullable:true})
    // plans:Plan[]
}
