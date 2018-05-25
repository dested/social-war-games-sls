import {Component} from '@nestjs/common';
import * as passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {JwtModel} from 'swg-server-common/bin/http/jwtModel';
import {Config} from 'swg-server-common/bin/config';

@Component()
export class JwtStrategy extends Strategy {
    constructor() {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
                secretOrKey: Config.jwtKey
            },
            async (req: any, payload: JwtModel, next: any) => await this.validateUser(req, payload, next)
        );
        passport.use(this);
    }

    async validateUser(req: any, payload: JwtModel, done: any): Promise<boolean> {
        req.factionId = payload.factionId;
        req.userId = payload.userId;
        req.maxVotesPerRound = payload.maxVotesPerRound;
        done(null, payload.factionId);
        return true;
    }
}
