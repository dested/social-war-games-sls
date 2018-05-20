import {Component} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {Config} from 'swg-server-common/bin/config';

@Component()
export class AuthService {
    async createToken(user: HttpUser): Promise<string> {
        const expiresIn = 24 * 60 * 60 * 365 * 10;
        const token = jwt.sign(user, Config.jwtKey, {expiresIn});
        return token;
    }
}
