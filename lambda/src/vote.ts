import * as jwt from 'jsonwebtoken';
import {Config} from '@swg-server-common/config';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameState} from '@swg-common/models/gameState';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameLogic, GameModel} from '@swg-common/../../common/src/game/gameLogic';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {VoteResult} from '@swg-common/game/voteResult';
import {EntityAction} from '@swg-common/game/entityDetail';
import {VoteRequestResults} from '@swg-common/models/http/voteResults';

let layout: GameLayout;
let gameState: GameState;
let game: GameModel;

export const handler = async (event: Event) => {
    let startTime = +new Date();
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return response('auth');

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
    try {
        const redisManager = await RedisManager.setup();
        console.log('connecting');
        console.log('connected to redis');
        const shouldStop = await redisManager.get<boolean>('stop');
        if (shouldStop) {
            return response('stopped');
        }

        const generation = await redisManager.get<number>('game-generation');
        const totalVotes = await redisManager.get<number>(`user-${user.id}-${generation}-votes`);

        if (totalVotes === undefined) {
            await redisManager.set<number>(`user-${user.id}-${generation}-votes`, 1);
            await redisManager.expire(`user-${user.id}-${generation}-votes`, Config.gameDuration * 2);
        }

        if (totalVotes > user.maxVotesPerRound) {
            return response('max_votes');
        }
        await redisManager.incr(`user-${user.id}-${generation}-votes`);

        layout = layout || (await redisManager.get<GameLayout>('layout'));
        if (!gameState || gameState.generation !== generation) {
            gameState = await redisManager.get<GameState>('game-state');
            game = GameLogic.buildGameFromState(layout, gameState);
        }

        const body = event.body;

        if (body.generation !== generation) {
            return response('bad_generation', {
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
            return response('vote_failed', {
                votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1,
                voteResult
            });
        }

        await DBVote.db.insertDocument(vote);
        let endTime = +new Date();

        return response('ok', {
            votesLeft: user.maxVotesPerRound - (totalVotes || 0) + 1,
            duration: endTime - startTime
        });
    } catch (ex) {
        console.log('er', ex);
        return response('error', ex.stack + JSON.stringify(event));
    }
};

function response(reason: VoteRequestResults, body: any = {}) {
    body.reason = reason;
    return {
        statusCode: 200,
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
