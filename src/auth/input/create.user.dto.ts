import { IsEmail, Length } from "class-validator";

export class CreateUserDto {
    @Length(5)
    username: string;
    @Length(8)
    password: string;
    @Length(8)
    retypedPassword: string;
    @Length(5)
    firstName: string;
    @Length(5)
    lastName: string;
    @IsEmail()
    email: string;
}