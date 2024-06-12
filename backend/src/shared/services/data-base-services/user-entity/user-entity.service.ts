import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Test} from "../../../entities/test.entity";
import {Repository} from "typeorm";
import {User} from "../../../entities/user.entity";
import {EventCategoryEnum} from "../../../enum/event-category.enum";
import {AbsoluteEvent} from "../../../entities/absolute-event.entity";

@Injectable()
export class UserEntityService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createUser(name: string, email: string, user_categories: EventCategoryEnum[]){
        const newUser = this.userRepository.create(
            {
                name: name,
                email: email,
                user_categories: user_categories,
                events: []
            });

        return this.userRepository.save(newUser);
    }

    async addEvenToUser(userId: number, event: AbsoluteEvent){
        const user = await this.userRepository.findOneBy({id: userId});
        user.events.push(event);

        return this.userRepository.save(user);
    }

    async editUser(User: User){
        const user = await this.userRepository.findOneBy({id: User.id});
        user.name = User.name;
        user.email = User.email;
        user.user_categories = User.user_categories;
        user.events = User.events;

        return this.userRepository.save(user);
    }

    async getUserByEmail(email: string){
        return this.userRepository.findOneBy({email: email});
    }

    async getUserById(userId: number){
        return this.userRepository.findOneBy({id: userId});
    }

    async deleteUser(userId: number){
        return this.userRepository.delete({id: userId});
    }
}
