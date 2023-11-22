import { Resolver, Query, Args, Int, Mutation, ResolveField, Parent } from '@nestjs/graphql';
import { PaginatedTeacher, Teacher } from './teacher.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherAddInput } from './input/teacher-add.input';
import { Logger, UseGuards } from '@nestjs/common';
import { TeacherEditInput } from './input/teacher-edit.input';
import { EntityWithId } from './school.types';
import { AuthGuardJwtGql } from 'src/auth/auth-guard-jwt.gql';
import { paginate } from 'src/pagination/paginator';

@Resolver(() => Teacher)
export class TeacherResolver {
    private readonly logger = new Logger(TeacherResolver.name);

    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>
    ) { }

    @Query(() => [Teacher])
    public async teachers(): Promise<PaginatedTeacher> {
        return paginate<Teacher, PaginatedTeacher>(
            this.teacherRepository.createQueryBuilder(),
            PaginatedTeacher
        );
    }

    @Query(() => Teacher)
    public async teacher(@Args('teacherId', { type: () => Int }) id: number): Promise<Teacher> {
        return this.teacherRepository.findOneOrFail({
            where: { id: id },
            // relations: ['subjects']
        },);
    }

    @Mutation(() => Teacher, { name: 'teacherAdd' })
    @UseGuards(AuthGuardJwtGql)
    public async add(
        @Args('input', { type: () => TeacherAddInput }) input: TeacherAddInput,
    ): Promise<Teacher> {
        return await this.teacherRepository.save(new Teacher(input));
    }

    @Mutation(() => Teacher, { name: 'teacherEdit' })
    public async edit(
        @Args('id', { type: () => Int }) id: number,
        @Args('input', { type: () => TeacherEditInput }) input: TeacherEditInput,
    ): Promise<Teacher> {
        const teacher = this.teacherRepository.findOneByOrFail({ id: id });
        return await this.teacherRepository.save(new Teacher({ ...teacher, ...input }));
    }

    @Mutation(() => EntityWithId, { name: 'teacherDelete' })
    public async delete(
        @Args('id', { type: () => Int }) id: number
    ): Promise<EntityWithId> {
        const teacher = await this.teacherRepository.findOneByOrFail({ id: id });
        await this.teacherRepository.remove(teacher);
        return new EntityWithId(id)
    }

    @ResolveField('subjects')
    public async subjects(
        @Parent() teacher: Teacher
    ) {
        this.logger.debug(`@ResolveField('subjects') was called`)
        return await teacher.subjects;
    }
}