import {CanActivate, ExecutionContext, Guard, HttpStatus} from '@nestjs/common';
import {HttpException} from '@nestjs/core';
import * as passport from 'passport';

@Guard()
export class AuthGuard implements CanActivate {
    constructor() {}
    async canActivate(dataOrRequest: any, context: ExecutionContext): Promise<boolean> {
        const isAuthenticated = await new Promise<boolean>((resolve, reject) => {
            passport.authenticate('jwt', {session: false}, (_, user, __) => {
                if (user) {
                    return resolve(true);
                }
                return resolve(false);
            })(dataOrRequest.res.req, dataOrRequest.res, dataOrRequest.next);
        });
        if (!isAuthenticated) {
            throw new HttpException('', HttpStatus.UNAUTHORIZED);
        }
        return true;
    }
}

@Guard()
export class OptionalAuthGuard implements CanActivate {
    constructor() {}
    async canActivate(dataOrRequest: any, context: ExecutionContext): Promise<boolean> {
        const isAuthenticated = await new Promise<boolean>((resolve, reject) => {
            passport.authenticate('jwt', {session: false}, (_, user, __) => {
                if (user) {
                    return resolve(true);
                }
                return resolve(false);
            })(dataOrRequest.res.req, dataOrRequest.res, dataOrRequest.next);
        });
        return true;
    }
}
