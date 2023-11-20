import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from './subject.entity';
import { ObjectType, Field } from "@nestjs/graphql";
@Entity()
@ObjectType()
export class Teacher {
  @PrimaryGeneratedColumn()
  @Field({ nullable: true })
  id: number;

  @Column()
  @Field({ nullable: true })
  name: string;

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @Field()
  subjects: Subject[];
}