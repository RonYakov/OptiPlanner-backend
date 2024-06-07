import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';

@Entity('test')
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: "json",nullable:true})
    array_test: number[];

    @Column({nullable:true})
    every: '1' | '2' | '3' | '4' = '1';

    @Column({nullable:true})
    description: string;

    @CreateDateColumn({nullable:true})
    last_update: Date;

}
