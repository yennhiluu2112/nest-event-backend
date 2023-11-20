import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, SerializeOptions, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from "./input/create-event.dto";
import { UpdateEventDto } from "./input/update-event.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attendee } from "./attendee.entity";
import { EventsService } from "./events.service";
import { ListEvents } from "./input/list.events";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AuthGuardJwt } from "src/auth/auth-guard.jwt";

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
    private readonly logger = new Logger(EventsController.name);

    constructor(
        @InjectRepository(Attendee)
        private readonly attendeeRepository: Repository<Attendee>,
        private readonly eventsService: EventsService
    ) { }


    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Query() filter: ListEvents) {
        this.logger.log('findAll route');
        const events = await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
            filter,
            {
                total: true,
                currentPage: filter.page,
                limit: 10,
            }
        );
        return events;
    }


    @Get('practice')
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

        // return await this.repository.createQueryBuilder('e')
        //     .select(['e.id', 'e.name'])
        //     .orderBy('e.id', 'DESC')
        //     .take(1)
        //     .getMany();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number,) {
        // const event = await this.repository.findOne({ where: { id: id } })
        const event = await this.eventsService.getEventWithAttendeeCount(id);

        if (!event) {
            throw new NotFoundException();
        }
        return event;


    }

    // @UsePipe s()
    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(AuthGuardJwt)
    async create(
        // @Body(new ValidationPipe({ groups: ['create'] })) input: CreateEventDto
        @Body() input: CreateEventDto,
        @CurrentUser() user: User
    ) {
        return await this.eventsService.createEvent(input, user);
    }

    @Patch(':id')
    @UseInterceptors(ClassSerializerInterceptor)
    async update(
        @Param('id', ParseIntPipe) id: number,
        // @Body(new ValidationPipe({ groups: ['update'] })) input: UpdateEventDto
        @Body() input: UpdateEventDto,
        @CurrentUser() user: User

    ) {
        const event = await this.eventsService.findOne(id)

        if (!event) {
            throw new NotFoundException();
        }

        if (event.organizerId !== user.id) {
            throw new ForbiddenException(null, 'You are not authorized to change this event')
        }

        return this.eventsService.updateEvent(event, input);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ) {
        const event = await this.eventsService.findOne(id)
        if (!event) {
            throw new NotFoundException();
        }
        // await this.repository.remove(event)

        if (event.organizerId !== user.id) {
            throw new ForbiddenException(null, 'You are not authorized to remove this event')
        }

        const result = await this.eventsService.deleteEvent(id);
        if (result?.affected !== 1) {
            throw new NotFoundException();
        }
    }

} 