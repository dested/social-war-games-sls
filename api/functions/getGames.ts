import {HttpUser} from '@swg-common/models/http/httpUser';
import {JwtGetUserResponse, RegisterRequestBody, StatsResponse} from '@swg-common/models/http/userController';
import {Config} from '@swg-server-common/config';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import * as jwt from 'jsonwebtoken';
import {DataManager} from '../../server-common/src/db/dataManager';
import {DBGame} from '../../server-common/src/db/models/dbGame';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function getGamesHandler(event: Event<void>): Promise<HttpResponse<StatsResponse>> {
  if (!event.headers || !event.headers.Authorization) {
    return respond(403, {error: 'auth'});
  }
  await DataManager.openDbConnection();

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;

  const games = await DBGame.db.getAll({});
  return respond(200, {
    games: games.map(DBGame.map),
  });
}
