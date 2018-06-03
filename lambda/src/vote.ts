import * as jwt from 'jsonwebtoken';
import {Config} from '@swg-server-common/config';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {EntityAction, GameHexagon, GameModel, VoteResult} from '@swg-common/game';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameState} from '@swg-common/models/gameState';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameLogic} from '@swg-common/game';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {Grid} from '@swg-common/hex/hex';

let layout: GameLayout;
let gameState: GameState;
let game: GameModel;
const grid = new Grid<GameHexagon>(0, 0, 100, 100);

export const handler = async (event: Event) => {
    let startTime = +new Date();
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return response(401);

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
    try {
        const redisManager = await RedisManager.setup();
        console.log('connecting');
        console.log('connected to redis');
        const shouldStop = await redisManager.get<boolean>('stop');
        if (shouldStop) {
            return response(409);
        }

        const generation = await redisManager.get<number>('game-generation');
        const totalVotes = await redisManager.get<number>(`user-${user.id}-${generation}-votes`);

        if (totalVotes === undefined) {
            await redisManager.set<number>(`user-${user.id}-${generation}-votes`, 1);
            await redisManager.expire(`user-${user.id}-${generation}-votes`, Config.gameDuration * 2);
        }

        if (totalVotes > user.maxVotesPerRound) {
            return response(423);
        }
        await redisManager.incr(`user-${user.id}-${generation}-votes`);

        layout = layout || (await redisManager.get<GameLayout>('layout'));
        if (!gameState || gameState.generation !== generation) {
            gameState = await redisManager.get<GameState>('game-state');
            game = GameLogic.buildGame(grid, layout, gameState);
        }

        const body = event.body;

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
        vote.userId = user.id;
        vote.factionId = user.factionId;

        let voteResult = GameLogic.validateVote(game, vote);
        if (voteResult !== VoteResult.Success) {
            return response(409, {
                votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1,
                voteResult
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
        return response(500, ex.stack + JSON.stringify(event));
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
