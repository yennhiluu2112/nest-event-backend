import { Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from "./input/create-event.dto";
import { UpdateEventDto } from "./input/update-event.dto";
import { Event } from "./event.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attendee } from "./attendee.entity";
import { EventsService } from "./events.service";
import { ListEvents } from "./input/list.events";

@Controller('/events')
export class EventsController {
    private readonly logger = new Logger(EventsController.name);

    constructor(
        @InjectRepository(Event)
        private readonly repository: Repository<Event>,
        @InjectRepository(Attendee)
        private readonly attendeeRepository: Repository<Attendee>,
        private readonly eventsService: EventsService
    ) { }


    @Get()
    async findAll(@Query() filter: ListEvents) {
        this.logger.log('findAll route');
        const events = await this.eventsService.getEventsWithAttendeeCountFiltered(filter);
        this.logger.debug(`Found ${events.length} events`);
        return events;
    }


    @Get('/practice')
    async practice() {
        // const event = await this.repository.findOne({ where: { id: 1 }, relations: ['attendees'] })
        // if (!event) {
        //     throw new NotFoundException();
        // }
        // const attendee = new Attendee();
        // attendee.name = 'Attendee 1';

        // event.attendees.push(attendee);

        // await this.repository.save(event)

        // return event;

        //----------------------------------------------------------------

        // const event = await this.repository.findOne({ where: { id: 1 } })
        // if (!event) {
        //     throw new NotFoundException();
        // }
        // const attendee = new Attendee();
        // attendee.name = 'Using cascade';
        // attendee.event = event;


        // await this.attendeeRepository.save(attendee);

        // return event;

        //------------------------------------------------------------------

        return await this.repository.createQueryBuilder('e')
            .select(['e.id', 'e.name'])
            .orderBy('e.id', 'DESC')
            .take(1)
            .getMany();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number,) {
        // const event = await this.repository.findOne({ where: { id: id } })
        const event = await this.eventsService.getEvent(id);

        if (!event) {
            throw new NotFoundException();
        }
        return event;


    }

    // @UsePipe s()
    @Post()
    async create(
        // @Body(new ValidationPipe({ groups: ['create'] })) input: CreateEventDto
        @Body() input: CreateEventDto
    ) {

        return await this.repository.save({
            ...input,
            when: new Date(input.when),
        });
    }

    @Patch(':id')
    async update(
        @Param('id') id,
        // @Body(new ValidationPipe({ groups: ['update'] })) input: UpdateEventDto
        @Body() input: UpdateEventDto

    ) {
        const event = await this.repository.findOne(id)

        if (!event) {
            throw new NotFoundException();
        }

        return await this.repository.save({
            ...event,
            ...input,
            when: input.when ? new Date(input.when) : event.when,

        });
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id) {
        const event = await this.repository.findOne(id)
        if (!event) {
            throw new NotFoundException();
        }
        await this.repository.remove(event)
    }

}