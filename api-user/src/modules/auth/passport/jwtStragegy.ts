import {Component} from '@nestjs/common';
import * as passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {Config} from '@swg-server-common/config';
import {HttpUser} from '@swg-common/models/http/httpUser';

@Component()
export class JwtStrategy extends Strategy {
    constructor() {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
                secretOrKey: Config.jwtKey
            },
            async (req: any, payload: HttpUser, next: any) => await this.validateUser(req, payload, next)
        );
        passport.use(this);
    }

    async validateUser(req: any, payload: HttpUser, done: any): Promise<boolean> {
        req.factionId = payload.factionId;
        req.userId = payload.id;
        req.maxVotesPerRound = payload.maxVotesPerRound;
        done(null, payload.factionId);
        return true;
    }
}
