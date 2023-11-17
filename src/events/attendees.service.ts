import { Repository } from "typeorm";
import { Attendee } from "./attendee.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AttendeesService {
    constructor(
        @InjectRepository(Attendee)
        private readonly attendeeRepository: Repository<Attendee>
    ) { }

    public async findByEventId(eventId: number): Promise<Attendee[]> {
        return await this.attendeeRepository.findBy({
            event: { id: eventId }
        })
    }

    public async findOneByUserIdAndEventId(userId: number, eventId: number): Promise<Attendee | undefined> {
        return await this.attendeeRepository.findOneBy(
            {
                event: { id: eventId },
                user: { id: userId }
            }
        )
    }


    public async createOrUpdate(input: any, eventId: number, userId: number): Promise<Attendee> {
        const attendee = await this.findOneByUserIdAndEventId(eventId, userId) ?? new Attendee();

        attendee.eventId = eventId;
        attendee.userId = userId;

        return await this.attendeeRepository.save(attendee);
    }
}