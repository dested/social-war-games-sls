import {RegisterRequestBody} from '@swg-common/models/http/userController';
import {getGamesHandler} from './functions/getGames';
import {ladderHandler} from './functions/ladder';
import {loginHandler} from './functions/login';
import {registerHandler} from './functions/register';
import {userDetailsHandler, UserDetailsRequestBody} from './functions/userDetails';
import {userStatsHandler} from './functions/userStats';
import {voteHandler, VoteRequestBody} from './functions/vote';
import {Event} from './utils/models';
import {startWorkerHandler, stopWorkerHandler} from './functions/wokerHandler';

module.exports.vote = async (event: Event<VoteRequestBody>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await voteHandler(event);
};

module.exports.userDetails = async (event: Event<UserDetailsRequestBody>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await userDetailsHandler(event);
};

module.exports.register = async (event: Event<RegisterRequestBody>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await registerHandler(event);
};

module.exports.login = async (event: Event<RegisterRequestBody>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await loginHandler(event);
};

module.exports.ladder = async (event: Event<void>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await ladderHandler(event);
};

module.exports.userStats = async (event: Event<void>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await userStatsHandler(event);
};

module.exports.getGames = async (event: Event<void>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await getGamesHandler(event);
};

module.exports.startWorker = async (event: Event<void>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await startWorkerHandler(event);
};

module.exports.stopWorker = async (event: Event<void>) => {
  event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
  event.body = JSON.parse((event.body as any) as string);
  return await stopWorkerHandler(event);
};
