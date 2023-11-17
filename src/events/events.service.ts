import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Event, PaginatedEvents } from "./event.entity";
import { Injectable, Logger } from "@nestjs/common";
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";
import { PaginateOptions, paginate } from "src/pagination/paginator";
import { CreateEventDto } from "./input/create-event.dto";
import { User } from "src/auth/user.entity";
import { UpdateEventDto } from "./input/update-event.dto";

@Injectable()
export class EventsService {

    private readonly logger = new Logger(EventsService.name);


    constructor(
        @InjectRepository(Event) private readonly eventsRepository: Repository<Event>
    ) { }

    private getEventsBaseQuery() {
        return this.eventsRepository
            .createQueryBuilder('e')
            .orderBy('e.id', 'DESC');
    }

    public async getEvent(id: number): Promise<Event> | undefined {
        const query = this.getEventsWithAttendeeCountQuery()
            .andWhere('e.id = :id', { id });

        this.logger.debug(await query.getSql())

        return await query.getOne();

    }

    public getEventsWithAttendeeCountQuery() {
        return this.getEventsBaseQuery()
            .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
            .loadRelationCountAndMap(
                'e.attendeeAccepted',
                'e.attendees',
                'attendee',
                (pb) => pb.where(
                    'attendee.answer = :answer',
                    { answer: AttendeeAnswerEnum.Accepted }
                )
            ).loadRelationCountAndMap(
                'e.attendeeMaybe',
                'e.attendees',
                'attendee',
                (pb) => pb.where(
                    'attendee.answer = :answer',
                    { answer: AttendeeAnswerEnum.Maybe }
                )
            ).loadRelationCountAndMap(
                'e.attendeeRejected',
                'e.attendees',
                'attendee',
                (pb) => pb.where(
                    'attendee.answer = :answer',
                    { answer: AttendeeAnswerEnum.Rejected }
                )
            );
    }

    private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
        let query = this.getEventsWithAttendeeCountQuery();

        if (!filter) {
            return query;
        }

        if (filter.when) {
            if (filter.when == WhenEventFilter.Today) {
                query = query.andWhere(
                    `e.when >= now() AND e.when <= now() + interval '1 day'`,
                )
            }
            if (filter.when == WhenEventFilter.Tomorrow) {
                query = query.andWhere(
                    `e.when >= now()  + interval '1 day' AND e.when <= now() + interval '2 day'`,
                )
            }
            if (filter.when == WhenEventFilter.ThisWeek) {
                query = query.andWhere(
                    `date_part('week', e.when) = date_part('week', now())`,
                )
            }
            if (filter.when == WhenEventFilter.NextWeek) {
                query = query.andWhere(
                    `date_part('week', e.when) = YEARWEEK('week', now()) + 1`,
                )
            }
        }

        return query;

    }

    public async getEventsWithAttendeeCountFilteredPaginated(
        filter: ListEvents,
        paginateOptions: PaginateOptions,
    ): Promise<PaginatedEvents> {
        return await paginate<Event>(
            await this.getEventsWithAttendeeCountFiltered(filter),
            paginateOptions,
        );

    }

    public async deleteEvent(id: number): Promise<DeleteResult> {
        return await this.eventsRepository.createQueryBuilder('e')
            .delete()
            .where('id = :id', { id })
            .execute();
    }

    public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
        return await this.eventsRepository.save({
            ...input,
            organizer: user,
            when: new Date(input.when),
        });
    }

    public async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {
        return await this.eventsRepository.save({
            ...event,
            ...input,
            when: input.when ? new Date(input.when) : event.when,

        });
    }

    public async getEventsOrganizedByUserIdPaginated(
        userId: number,
        paginatedOptions: PaginateOptions
    ): Promise<PaginatedEvents> {
        return await paginate<Event>(
            this.getEventsOrganizedByUserIdQuery(userId),
            paginatedOptions,
        );
    }

    private getEventsOrganizedByUserIdQuery(userId: number) {
        return this.getEventsBaseQuery()
            .where('e.organizerId = :userId', { userId });
    }

    public async getEventsAttendedByUserIdPaginated(
        userId: number,
        paginatedOptions: PaginateOptions
    ): Promise<PaginatedEvents> {
        return await paginate<Event>(
            this.getEventsAttendedByUserIdQuery(userId),
            paginatedOptions,
        );
    }

    private getEventsAttendedByUserIdQuery(userId: number) {
        return this.getEventsBaseQuery()
            .leftJoinAndSelect('e.attendees', 'a')
            .where('a.userId = :userId', { userId });
    }
}