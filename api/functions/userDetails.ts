import * as jwt from 'jsonwebtoken';
import {Config} from '@swg-server-common/config';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {EntityAction} from '@swg-common/game/entityDetail';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {Event} from '../models';

export async function userDetailsHandler(event: Event<UserDetailsRequestBody>){
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return error('auth');

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
    try {
        const redisManager = await RedisManager.setup();
        console.log('connecting');
        console.log('connected to redis');

        const generation = await redisManager.get<number>('game-generation');
        const totalVotes = await redisManager.get<number>(`user-${user.id}-${generation}-votes`, 0);
        const factionToken = await redisManager.getString(`faction-token-${generation}-${user.factionId}`);

        return response({
            voteCount: totalVotes,
            maxVotes: user.maxVotesPerRound,
            factionToken
        });
    } catch (ex) {
        console.log('er', ex);
        return error(ex.stack + JSON.stringify(event));
    }
}


function response(userDetails: UserDetails) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: userDetails
    };
}

function error(error: string) {
    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json'
        },
        body: error
    };
}

export interface UserDetailsRequestBody {
}
