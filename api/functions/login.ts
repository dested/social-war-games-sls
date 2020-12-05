import {JwtGetUserResponse, LoginRequestBody, RegisterRequestBody} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import * as bcrypt from 'bcryptjs';
import {Timer} from '@swg-common/utils/timer';
import {AuthService} from '../utils/authService';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function loginHandler(event: Event<LoginRequestBody>): Promise<HttpResponse<JwtGetUserResponse>> {
  const model = event.body;


  const login = new Timer();
  login.add('query');
  const user = await DBUser.db.getOne({email:model.email});
  login.add('get db');
  if (!user) {
    await bcrypt.compare('dog', 'cat');
    return respond(400, {error: 'Email or Password Incorrect'});
  }

  if (!(await bcrypt.compare(model.password, user.passwordHash))) {
    return respond(400, {error: 'Email or Password Incorrect'});
  }
  login.add('bcrypt');

  const httpUser = DBUser.map(user);
  const jwt = await AuthService.createToken(httpUser);
  login.add('jwt');
  return respond(200, {
    jwt,
    time: login.print(),
    user: httpUser,
  });
}
