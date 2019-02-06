import {RegisterRequestBody} from '@swg-common/models/http/userController';
import {getGamesHandler} from './functions/getGames';
import {ladderHandler} from './functions/ladder';
import {loginHandler} from './functions/login';
import {registerHandler} from './functions/register';
import {userDetailsHandler, UserDetailsRequestBody} from './functions/userDetails';
import {userStatsHandler} from './functions/userStats';
import {voteHandler, VoteRequestBody} from './functions/vote';
import {Event} from './utils/models';

module.exports.vote = async (event: Event<VoteRequestBody>) => await voteHandler(event);

module.exports.userDetails = async (event: Event<UserDetailsRequestBody>) => await userDetailsHandler(event);

module.exports.register = async (event: Event<RegisterRequestBody>) => await registerHandler(event);

module.exports.login = async (event: Event<RegisterRequestBody>) => await loginHandler(event);

module.exports.ladder = async (event: Event<void>) => await ladderHandler(event);

module.exports.userStats = async (event: Event<void>) => await userStatsHandler(event);

module.exports.getGames = async (event: Event<void>) => await getGamesHandler(event);
