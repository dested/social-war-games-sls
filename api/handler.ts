import {Event} from './utils/models';
import {VoteRequestBody, voteHandler} from './functions/vote';
import {UserDetailsRequestBody, userDetailsHandler} from './functions/userDetails';
import {RegisterRequestBody} from '@swg-common/models/http/userController';
import {registerHandler} from './functions/register';
import {loginHandler} from './functions/login';
import {ladderHandler} from './functions/ladder';
import {userStatsHandler} from './functions/userStats';

module.exports.vote = async (event: Event<VoteRequestBody>) => {
    return await voteHandler(event);
};

module.exports.userDetails = async (event: Event<UserDetailsRequestBody>) => {
    return await userDetailsHandler(event);
};

module.exports.register = async (event: Event<RegisterRequestBody>) => {
    return await registerHandler(event);
};

module.exports.login = async (event: Event<RegisterRequestBody>) => {
    return await loginHandler(event);
};

module.exports.ladder = async (event: Event<void>) => {
    return await ladderHandler(event);
};

module.exports.userStats = async (event: Event<void>) => {
    return await userStatsHandler(event);
};

