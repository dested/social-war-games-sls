import {EntityAction} from '@swg-common/game/entityDetail';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {Config} from '@swg-server-common/config';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import * as jwt from 'jsonwebtoken';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

interface UserDetailsResponse {
  generation: number;
  voteCount: number;
  maxVotes: number;
  factionToken: string;
}

export async function userDetailsHandler(
  event: Event<UserDetailsRequestBody>
): Promise<HttpResponse<UserDetailsResponse>> {

  if (!event.headers || !event.headers.Authorization || !event.headers.gameid) {
    return respond(403, {error: 'auth'});
  }
  const gameId = event.headers.gameid;

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
  try {
    const redisManager = await RedisManager.setup();
    const generation = await redisManager.get<number>(gameId, 'game-generation');
    const totalVotes = await redisManager.get<number>(gameId, `user-${user.id}-${generation}-votes`, 0);
    const factionToken = await redisManager.getString(gameId, `faction-token-${generation}-${user.factionId}`);

    return respond(200, {
      generation,
      voteCount: totalVotes,
      maxVotes: user.maxVotesPerRound,
      factionToken,
    });
  } catch (ex) {
    console.log('er', ex);
    return respond(500, {error: ex.stack + JSON.stringify(event)});
  }
}

export interface UserDetailsRequestBody {}
