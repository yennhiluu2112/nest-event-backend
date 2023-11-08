import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./event.entity";
import { Injectable, Logger } from "@nestjs/common";
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";

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

    public async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
        let query = this.getEventsWithAttendeeCountQuery();

        if (!filter) {
            return query.getMany();
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

        return await query.getMany();

    }


}