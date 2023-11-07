import { Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from "./create-event.dto";
import { UpdateEventDto } from "./update-event.dto";
import { Event } from "./event.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Controller('/events')
export class EventsController {
    private readonly logger = new Logger(EventsController.name);

    constructor(
        @InjectRepository(Event)
        private readonly repository: Repository<Event>
    ) { }



    @Get()
    async findAll() {
        this.logger.log('findAll route');
        const events = await this.repository.find();
        this.logger.debug(`Found ${events.length} events`);
        return events;
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number,) {
        console.log(typeof id)
        const event = await this.repository.findOne({ where: { id: id } })
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