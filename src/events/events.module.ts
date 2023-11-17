import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { Event } from './event.entity';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { AttendeesService } from './attendees.service';
import { EventAttendeesController } from './event-attendees.controller';
import { EventsOrganizedByUserController } from './events-organized-by-user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Attendee]),
    ],
    controllers: [EventsController, EventAttendeesController, EventsOrganizedByUserController],
    providers: [EventsService, AttendeesService]

})
export class EventsModule { }
