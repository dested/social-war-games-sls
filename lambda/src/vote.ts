import {DataManager} from 'swg-server-common/bin/db/dataManager';
import {DBUser} from 'swg-server-common/bin/db/models/dbUser';
import * as jwt from 'jsonwebtoken';
import {Config} from 'swg-server-common/bin/config';
import {JwtModel} from 'swg-server-common/bin/http/jwtModel';
import {DBVote} from 'swg-server-common/bin/db/models/dbVote';
import {EntityAction} from 'swg-common/bin/game';
import {RedisManager} from 'swg-server-common/bin/redis/redisManager';

export const handler = async (event: Event) => {
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return response(401);

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as JwtModel;
    try {
        const redisManager = await RedisManager.setup();
        console.log('connecting');
        console.log('connected to redis');
        const shouldStop = await redisManager.get<boolean>('stop');
        if (shouldStop) {
            return response(409);
        }

        const generation = await redisManager.get<number>('game-generation');
        const totalVotes = await redisManager.get<number>(`user-${user.userId}-${generation}-votes`);

        if (totalVotes === undefined) {
            await redisManager.set<number>(`user-${user.userId}-${generation}-votes`, 1);
            await redisManager.expire(`user-${user.userId}-${generation}-votes`, Config.gameDuration * 2);
        }

        if (totalVotes > user.maxVotesPerRound) {
            return response(423);
        }
        await redisManager.incr(`user-${user.userId}-${generation}-votes`);

        await redisManager.get<number>('gameLayout');

        const body = JSON.parse(event.body) as RequestBody;

        const vote = new DBVote();
        vote.action = body.action;
        vote.entityId = body.entityId;
        vote.generation = body.generation;
        vote.hexId = body.hexId;
        vote.userId = user.userId;
        vote.factionId = user.factionId;

        await DBVote.db.insertDocument(vote);
        delete vote._id;
        await DBVote.db.insertDocument(vote);
        return response(200, {
            votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1
        });
    } catch (ex) {
        console.log('er', ex);
        return response(500);
    }
};

function response(code: number, body: any = null) {
    return {
        statusCode: code,
        headers: {'Content-Type': 'application/json'},
        body: body ? JSON.stringify(body) : undefined
    };
}

interface Event {
    body: string;
    headers: Headers;
    httpMethod: string;
    path: string;
}

interface Headers {
    Authorization: string;
}

interface RequestBody {
    entityId: string;
    action: EntityAction;
    generation: number;
    hexId: string;
}
