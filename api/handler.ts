import {Event} from './models';
import {VoteRequestBody, voteHandler} from './functions/vote';
import {UserDetailsRequestBody, userDetailsHandler} from './functions/userDetails';

module.exports.vote = async (event: Event<VoteRequestBody>) => {
    return await voteHandler(event);
};

module.exports.userDetails = async (event: Event<UserDetailsRequestBody>) => {
    return await userDetailsHandler(event);
};

