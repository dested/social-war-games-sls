import * as jwt from 'jsonwebtoken';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {Config} from '@swg-server-common/config';

export class AuthService {
  static async createToken(user: HttpUser): Promise<string> {
    const expiresIn = 24 * 60 * 60 * 365 * 10;
    const token = jwt.sign(user, Config.jwtKey, {expiresIn});
    return token;
  }
}
