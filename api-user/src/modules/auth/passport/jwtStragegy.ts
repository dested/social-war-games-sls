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

    async validateUser(req: any, relationship: JwtModel, done: any): Promise<boolean> {
        req.relationshipId = relationship.relationshipId;
        req.userNumber = relationship.userNumber;
        done(null, relationship.relationshipId);
        return true;
    }
}
