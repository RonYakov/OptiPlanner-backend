import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../shared/entities/test.entity';
import {AbsoluteEvent} from "../shared/entities/absolute-event.entity";
import {
    AbsoluteEventEntityService
} from "../shared/services/data-base-services/absoulte-event-entity/absolute-event-entity.service";

@Injectable()
export class TestService {

    constructor(
        @InjectRepository(Test)
        private testRepository: Repository<Test>,
        private absoluteEventEntityService: AbsoluteEventEntityService ,
    ) {}

        async createTest(name: string, description: string, array_test: any[], every: '1' | '2' | '3' | '4'){
        const newTest = this.testRepository.create({ name: name, description: description, array_test: array_test,last_update: new Date()});

        return this.testRepository.save(newTest);
    }

    async getTest(){
        return this.testRepository.find();
    }

    async getEventsByDates() {
        return await this.absoluteEventEntityService.getEventsByDateRange(1,new Date('2024-08-08T00:00:00.000Z'), new Date('2024-08-10T08:02:00.000Z'));
    }
}
