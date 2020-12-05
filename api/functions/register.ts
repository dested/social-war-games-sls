import {JwtGetUserResponse, RegisterRequestBody} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import * as bcrypt from 'bcryptjs';
import {Timer} from '@swg-common/utils/timer';
import {AuthService} from '../utils/authService';
import {FactionUtils} from '../utils/factionUtils';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function registerHandler(event: Event<RegisterRequestBody>): Promise<HttpResponse<JwtGetUserResponse>> {
  const model = event.body;
  const register = new Timer();
  const foundUsers = await DBUser.db.count(
      {$or: [{email: model.email}, {userName: model.userName}]}
  );
  register.add('found users');
  if (foundUsers > 0) {
    return respond(400, {error: 'Account already exists'});
  }
  const user = new DBUser();
  user.email = model.email;
  user.userName = model.userName;
  user.maxVotesPerRound = 3;
  user.passwordHash = await bcrypt.hash(model.password, 3);
  register.add('bcrypt');
  user.factionId = FactionUtils.randomFaction();
  user.createdDate = new Date();

  await DBUser.db.insertDocument(user);
  register.add('insert');

  const httpUser = DBUser.map(user);
  const jwt = await AuthService.createToken(httpUser);
  register.add('jwt');
  return respond(200, {
    jwt,
    time: register.print(),
    user: httpUser,
  });
}
