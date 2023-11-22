import { IsEmail, Length } from "class-validator";
import { IsRepeated } from "src/validation/is-repeated.constraint";
import { UserDoesNotExist } from "./validation/user-does-not-exist.constraint";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateUserDto {
    @Length(5)
    @UserDoesNotExist()
    @Field()
    username: string;

    @Length(8)
    @Field()
    password: string;

    @Length(8)
    @IsRepeated('password')
    @Field()
    retypedPassword: string;

    @Length(5)
    @Field()
    firstName: string;

    @Field()
    @Length(5)
    lastName: string;

    @IsEmail()
    @UserDoesNotExist()
    @Field()
    email: string;
}