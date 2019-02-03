import * as jwt from 'jsonwebtoken';
import {HttpUser} from '../../common/src/models/http/httpUser';
import {Config} from '../../server-common/src/config';

export class AuthService {
  static async createToken(user: HttpUser): Promise<string> {
    const expiresIn = 24 * 60 * 60 * 365 * 10;
    const token = jwt.sign(user, Config.jwtKey, {expiresIn});
    return token;
  }
}
