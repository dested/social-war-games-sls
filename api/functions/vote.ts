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
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';
import {VoteResponse} from '@swg-common/models/http/voteResults';
import {DataManager} from '@swg-server-common/db/dataManager';


let layout: GameLayout;
let gameState: GameState;
let game: GameModel;

export async function voteHandler(event: Event<VoteRequestBody>): Promise<HttpResponse<VoteResponse>> {
    let startTime = +new Date();
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return respond(400, {error: 'auth'});

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
    try {
        const redisManager = await RedisManager.setup();
        await DataManager.openDbConnection();
        console.log('connecting');
        console.log('connected to redis');
        const shouldStop = await redisManager.get<boolean>('stop');
        if (shouldStop) {
            return respond(400, {error: 'stopped'});
        }

        const generation = await redisManager.get<number>('game-generation');
        let totalVotes = await redisManager.get<number>(`user-${user.id}-${generation}-votes`, 0);

        if (totalVotes === undefined) {
            await redisManager.set<number>(`user-${user.id}-${generation}-votes`, 1);
            await redisManager.expire(`user-${user.id}-${generation}-votes`, Config.gameDuration * 2);
        }

        if (totalVotes >= user.maxVotesPerRound) {
            return respond(400, {error: 'max_votes'});
        }
        await redisManager.incr(`user-${user.id}-${generation}-votes`);
        totalVotes++;

        const body = event.body;

        const voteHexes = await redisManager.getString(`user-${user.id}-${generation}-vote-hex`, '');
        if (voteHexes.indexOf(body.entityId + ' ') >= 0) {
            return respond(200, {
                reason: `cant_vote_twice` as VoteRequestResults,
                votesLeft: user.maxVotesPerRound - totalVotes,
                processedTime: 0

            });
        }

        layout = layout || (await redisManager.get<GameLayout>('layout'));
        if (!gameState || gameState.generation !== generation) {
            gameState = await redisManager.get<GameState>('game-state');
            game = GameLogic.buildGameFromState(layout, gameState);
        }

        if (body.generation !== generation) {
            return respond(200, {
                reason: 'bad_generation' as VoteRequestResults,
                votesLeft: user.maxVotesPerRound - totalVotes,
                processedTime: +new Date(),
                generation
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
            return respond(200, {
                reason: 'vote_failed' as VoteRequestResults,
                votesLeft: user.maxVotesPerRound - totalVotes,
                processedTime: +new Date(),
                voteResult
            });
        }

        await redisManager.append(`user-${user.id}-${generation}-vote-hex`, `${vote.entityId} `);
        await redisManager.expire(`user-${user.id}-${generation}-vote-hex`, Config.gameDuration * 2);

        await DBVote.db.insertDocument(vote);
        let endTime = +new Date();

        return respond(200, {
            reason: 'ok' as VoteRequestResults,
            votesLeft: user.maxVotesPerRound - totalVotes,
            duration: endTime - startTime,
            processedTime: endTime
        });
    } catch (ex) {
        console.log('er', ex);
        return respond(500, {error: ex.stack + JSON.stringify(event)});
    }
}


export interface VoteRequestBody {
    reason: VoteRequestResults;
    entityId: number;
    action: EntityAction;
    generation: number;
    hexId: string;
}