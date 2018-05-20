import {CanActivate, ExecutionContext, Guard, HttpStatus} from '@nestjs/common';
import {HttpException} from '@nestjs/core';
import * as passport from 'passport';

@Guard()
export class AuthGuard implements CanActivate {
    async canActivate(dataOrRequest: any, context: ExecutionContext): Promise<boolean> {
        const isAuthenticated = await new Promise<boolean>((resolve, reject) => {
            passport.authenticate('jwt', {session: false}, (_, relationship, __) => {
                if (relationship) {
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
