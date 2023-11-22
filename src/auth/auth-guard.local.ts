import { AuthGuard } from "@nestjs/passport";

//only REST API
export class AuthGuardLocal extends AuthGuard('local') { }