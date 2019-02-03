import {EntityAction} from '@swg-common/game/entityDetail';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {Config} from '@swg-server-common/config';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import * as jwt from 'jsonwebtoken';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

interface UserDetailsResponse {
  voteCount: number;
  maxVotes: number;
  factionToken: string;
}

export async function userDetailsHandler(
  event: Event<UserDetailsRequestBody>
): Promise<HttpResponse<UserDetailsResponse>> {
  console.log('auth', event);
  if (!event.headers || !event.headers.Authorization) {
    return respond(403, {error: 'auth'});
  }

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
  try {
    const redisManager = await RedisManager.setup();
    console.log('connecting');
    console.log('connected to redis');

    const generation = await redisManager.get<number>('game-generation');
    const totalVotes = await redisManager.get<number>(`user-${user.id}-${generation}-votes`, 0);
    const factionToken = await redisManager.getString(`faction-token-${generation}-${user.factionId}`);

    return respond(200, {
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
