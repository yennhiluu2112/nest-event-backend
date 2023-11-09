import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Event } from "../events/event.entity";
import { Attendee } from "src/events/attendee.entity";
import { Subject } from "src/school/subject.entity";
import { Teacher } from "src/school/teacher.entity";
import { Profile } from "src/auth/profile.entity";
import { User } from "src/auth/user.entity";

export default registerAs(
    'orm.config', (): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Event, Attendee, Subject, Teacher, User, Profile],
        synchronize: true,
        logging: true,
    }));