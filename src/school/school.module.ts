import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';
import { TrainingController } from "./training.controller";
import { TeacherResolver } from "./teacher.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      Teacher,
    ])
  ],
  controllers: [TrainingController],
  providers: [TeacherResolver]
})
export class SchoolModule { }