import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';
import { TrainingController } from "./training.controller";
import { TeacherResolver } from "./teacher.resolver";
import { SubjectResolver } from "./subject.resolver";
import { CourseResolver } from "./course.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      Teacher,
    ])
  ],
  controllers: [TrainingController],
  providers: [TeacherResolver, SubjectResolver, CourseResolver]
})
export class SchoolModule { }