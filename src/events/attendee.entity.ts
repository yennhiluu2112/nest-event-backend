import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";
import { Expose } from "class-transformer";
import { User } from "src/auth/user.entity";

export enum AttendeeAnswerEnum {
    Accepted = 1,
    Maybe,
    Rejected,
}
@Entity('attendee')
export class Attendee {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @ManyToOne(() => Event, (event) => event.attendees, { nullable: false })
    event: Event

    @Column()
    eventId: number

    @Column('enum', {
        enum: AttendeeAnswerEnum,
        default: AttendeeAnswerEnum.Accepted,
    })
    @Expose()
    answer: AttendeeAnswerEnum

    @ManyToOne(() => User, (user) => user.attended)
    @Expose()
    user: User

    @Column({ nullable: true })
    userId: number
}