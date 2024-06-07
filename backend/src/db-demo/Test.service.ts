import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../shared/entities/test.entity';

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test)
        private testRepository: Repository<Test>,
    ) {}

        async createTest(name: string, description: string, array_test: any[], every: '1' | '2' | '3' | '4'){
        const newTest = this.testRepository.create({ name: name, description: description, array_test: array_test,last_update: new Date()});

        return this.testRepository.save(newTest);
    }

    async getTest(){
        return this.testRepository.find();
    }
}
