import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {TestService} from "./db-demo/Test.service";


@Controller()
export class AppController {
  constructor(private readonly appService: AppService ,
              private testService: TestService) {}

  @Get('/db-demo')
  async writeTest() {
    return await this.testService.createTest('ido', 'hamilton', [{name: 'ido', age: 23}, {type: 'bla bla'}], '2' ).then(res => {
      return res;
    })
  }

  @Get('/db-demo/get-tests')
  async getTests() {
    return await this.testService.getTest().then(res => {
      return res;
    })
  }
}
