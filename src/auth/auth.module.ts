import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { LocalStrategy } from "./local.strategy";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { UsersController } from "./users.controller";
import { AuthResolver } from "./auth.resolver";
import { UserResolver } from "./user.resolver";
import { UserService } from "./input/user.service";
import { UserDoesNotExistConstraint } from "./input/validation/user-does-not-exist.constraint";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.AUTH_SECRET,
                signOptions: {
                    expiresIn: '60m'
                }
            })
        })
    ],
    providers: [
        LocalStrategy,
        JwtStrategy,
        AuthService,
        AuthResolver,
        UserResolver,
        UserService,
        UserDoesNotExistConstraint
    ],
    controllers: [AuthController, UsersController]

})
export class AuthModule {

}