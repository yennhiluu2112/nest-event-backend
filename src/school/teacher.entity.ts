import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from './subject.entity';
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { Gender } from "./school.types";
import { Course } from "./course.entity";
import { Paginated } from "src/pagination/paginator";
@Entity()
@ObjectType()
export class Teacher {
  constructor(
    partial?: Partial<Teacher>
  ) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Field({ nullable: true })
  id: number;

  @Column()
  @Field({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Other
  })
  @Field(type => Gender)
  gender: Gender

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @Field(type => [Subject])
  subjects: Promise<Subject[]>

  @OneToMany(() => Course, (course) => course.teacher)
  @Field(() => [Course])
  courses: Promise<Course[]>
}

@ObjectType()
export class PaginatedTeacher extends Paginated<Teacher>(Teacher) { }