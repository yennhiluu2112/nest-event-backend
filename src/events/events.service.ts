import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, SelectQueryBuilder } from "typeorm";
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

    private getEventsBaseQuery(): SelectQueryBuilder<Event> {
        return this.eventsRepository
            .createQueryBuilder('e')
            .orderBy('e.id', 'DESC');
    }

    public async getEventWithAttendeeCount(id: number): Promise<Event> | undefined {
        const query = this.getEventsWithAttendeeCountQuery()
            .andWhere('e.id = :id', { id });

        this.logger.debug(await query.getSql())

        return await query.getOne();

    }

    public getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
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

    private getEventsWithAttendeeCountFilteredQuery(filter?: ListEvents): SelectQueryBuilder<Event> {
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
        return await paginate<Event, PaginatedEvents>(
            await this.getEventsWithAttendeeCountFilteredQuery(filter),
            PaginatedEvents,
            paginateOptions,
        );

    }

    public async findOne(id: number): Promise<Event | undefined> {
        return await this.eventsRepository.findOneBy({ id: id })
    }

    public async deleteEvent(id: number): Promise<DeleteResult> {
        return await this.eventsRepository.createQueryBuilder('e')
            .delete()
            .where('id = :id', { id })
            .execute();
    }

    public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
        return await this.eventsRepository.save(
            new Event({
                ...input,
                organizer: user,
                when: new Date(input.when),
            })
        );
    }

    public async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {
        return await this.eventsRepository.save(
            new Event({
                ...event,
                ...input,
                when: input.when ? new Date(input.when) : event.when,

            })
        );
    }

    public async getEventsOrganizedByUserIdPaginated(
        userId: number,
        paginatedOptions: PaginateOptions
    ): Promise<PaginatedEvents> {
        return await paginate<Event, PaginatedEvents>(
            this.getEventsOrganizedByUserIdQuery(userId),
            PaginatedEvents,
            paginatedOptions,
        );
    }

    private getEventsOrganizedByUserIdQuery(userId: number): SelectQueryBuilder<Event> {
        return this.getEventsBaseQuery()
            .where('e.organizerId = :userId', { userId });
    }

    public async getEventsAttendedByUserIdPaginated(
        userId: number,
        paginatedOptions: PaginateOptions
    ): Promise<PaginatedEvents> {
        return await paginate<Event, PaginatedEvents>(
            this.getEventsAttendedByUserIdQuery(userId),
            PaginatedEvents,
            paginatedOptions,
        );
    }

    private getEventsAttendedByUserIdQuery(userId: number): SelectQueryBuilder<Event> {
        return this.getEventsBaseQuery()
            .leftJoinAndSelect('e.attendees', 'a')
            .where('a.userId = :userId', { userId });
    }
}