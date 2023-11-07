import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AppJapanService {

    constructor(
        @Inject('APP_NAME')
        private readonly name: string,
        @Inject('MESSAGE')
        private readonly message: string

    ) { }


    getHello(): string {
        console.log
        return `Hello World Japan! from ${this.name} ${this.message}`;
    }
}