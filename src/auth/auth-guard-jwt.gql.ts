import { ExecutionContext } from "@nestjs/common";
import { AuthGuardJwt } from "./auth-guard.jwt";
import { GqlExecutionContext } from "@nestjs/graphql";

export class AuthGuardJwtGql extends AuthGuardJwt {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);

        return ctx.getContext().req;
    }
}