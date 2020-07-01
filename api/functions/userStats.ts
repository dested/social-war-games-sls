import {HttpUser} from '@swg-common/models/http/httpUser';
import {JwtGetUserResponse, RegisterRequestBody, StatsResponse} from '@swg-common/models/http/userController';
import {Config} from '@swg-server-common/config';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import * as jwt from 'jsonwebtoken';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function userStatsHandler(event: Event<void>): Promise<HttpResponse<StatsResponse>> {
  if (!event.headers || !event.headers.Authorization || !event.headers.gameid) {
    return respond(403, {error: 'auth'});
  }

  const gameId = event.headers.gameid;

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;

  const userStats = await DBUserRoundStats.getByUserId(gameId, user.id);
  return respond(200, {
    roundsParticipated: userStats.roundsParticipated,
  });
}
