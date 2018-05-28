import {DataManager} from '@swg-server-common/db/dataManager';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import * as jwt from 'jsonwebtoken';
import {Config} from '@swg-server-common/config';
import {JwtModel} from '@swg-server-common/http/jwtModel';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {EntityAction} from '@swg-common/game';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameState} from '@swg-common/models/gameState';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameLogic} from '@swg-common/game';

let layout: GameLayout;
let gameState: GameState;
let game: GameLogic;

export const handler = async (event: Event) => {
    let startTime = +new Date();
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

        layout = layout || (await redisManager.get<GameLayout>('layout'));
        if (!gameState || gameState.generation !== generation) {
            gameState = await redisManager.get<GameState>('game-state');
            game = GameLogic.buildGame(layout, gameState);
        }

        const body = event.body ;

        if (body.generation !== generation) {
            return response(417, {
                votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1
            });
        }

        const vote = new DBVote();
        vote.action = body.action;
        vote.entityId = body.entityId;
        vote.generation = body.generation;
        vote.hexId = body.hexId;
        vote.userId = user.userId;
        vote.factionId = user.factionId;

        if (!GameLogic.validateVote(game, vote)) {
            return response(417, {
                votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1
            });
        }

        await DBVote.db.insertDocument(vote);
        let endTime = +new Date();

        return response(200, {
            votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1,
            duration: endTime - startTime
        });
    } catch (ex) {
        console.log('er', ex);
        return response(500, ex.stack+JSON.stringify(event));
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
    body: RequestBody;
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
