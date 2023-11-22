import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy } from "passport-local";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    private readonly logger = new Logger(LocalStrategy.name);

    constructor(
        private readonly authService: AuthService
    ) {
        super();
    }

    public async validate(
        username: string,
        password: string
    ): Promise<any> {
        return await this.authService.validateUser(username, password)

    }
}