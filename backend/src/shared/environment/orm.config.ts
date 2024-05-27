import {TypeOrmModuleOptions} from "@nestjs/typeorm";


export const ormConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'opti-planner-db.c74o394yibc7.us-east-1.rds.amazonaws.com',
    username: 'postgres',
    port: 5432,
    database: 'init_optiPlanner_DB',
    password: '123456789',
    synchronize: true,
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
}
