import {GameLogic, GameModel} from '@swg-common/../../common/src/game/gameLogic';
import {EntityAction} from '@swg-common/game/entityDetail';
import {VoteResult} from '@swg-common/game/voteResult';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {VoteResponse} from '@swg-common/models/http/voteResults';
import {VoteRequestResults} from '@swg-common/models/http/voteResults';
import {Config} from '@swg-server-common/config';
import {DataManager} from '@swg-server-common/db/dataManager';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import * as jwt from 'jsonwebtoken';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

let layout: GameLayout;
let gameState: GameState;
let game: GameModel;

export async function voteHandler(event: Event<VoteRequestBody>): Promise<HttpResponse<VoteResponse>> {
  const startTime = +new Date();
  if (!event.headers || !event.headers.Authorization || !event.headers.GameId) {
    return respond(400, {error: 'auth'});
  }
  const gameId = event.headers.GameId;

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;
  try {
    const redisManager = await RedisManager.setup();
    await DataManager.openDbConnection();
    const shouldStop = await redisManager.get<boolean>(gameId, 'stop');
    if (shouldStop) {
      return respond(400, {error: 'stopped'});
    }

    const generation = await redisManager.get<number>(gameId, 'game-generation');
    let totalVotes = await redisManager.get<number>(gameId, `user-${user.id}-${generation}-votes`, 0);

    if (totalVotes === undefined) {
      await redisManager.set<number>(gameId, `user-${user.id}-${generation}-votes`, 1);
      await redisManager.expire(gameId, `user-${user.id}-${generation}-votes`, Config.gameDuration * 2);
    }

    if (totalVotes >= user.maxVotesPerRound) {
      return respond(400, {error: 'max_votes'});
    }
    await redisManager.incr(gameId, `user-${user.id}-${generation}-votes`);
    totalVotes++;

    const body = event.body;

    const voteHexes = await redisManager.getString(gameId, `user-${user.id}-${generation}-vote-hex`, '');
    if (voteHexes.indexOf(body.entityId + ' ') >= 0) {
      return respond(200, {
        reason: `cant_vote_twice` as VoteRequestResults,
        votesLeft: user.maxVotesPerRound - totalVotes,
        processedTime: 0,
      });
    }

    layout = layout || (await redisManager.get<GameLayout>(gameId, 'layout'));
    if (!gameState || gameState.generation !== generation) {
      gameState = await redisManager.get<GameState>(gameId, 'game-state');
      game = GameLogic.buildGameFromState(layout, gameState);
    }

    if (body.generation !== generation) {
      return respond(200, {
        reason: 'bad_generation' as VoteRequestResults,
        votesLeft: user.maxVotesPerRound - totalVotes,
        processedTime: +new Date(),
        generation,
      });
    }

    const vote = new DBVote();
    vote.gameId = gameId;
    vote.action = body.action;
    vote.entityId = body.entityId;
    vote.generation = body.generation;
    vote.hexId = body.hexId;
    vote.userId = user.id;
    vote.factionId = user.factionId;

    const voteResult = GameLogic.validateVote(game, vote);
    if (voteResult !== VoteResult.Success) {
      return respond(200, {
        reason: 'vote_failed' as VoteRequestResults,
        votesLeft: user.maxVotesPerRound - totalVotes,
        processedTime: +new Date(),
        voteResult,
      });
    }

    await redisManager.append(gameId, `user-${user.id}-${generation}-vote-hex`, `${vote.entityId} `);
    await redisManager.expire(gameId, `user-${user.id}-${generation}-vote-hex`, Config.gameDuration * 2);

    await DBVote.db.insertDocument(vote);
    const endTime = +new Date();

    return respond(200, {
      reason: 'ok' as VoteRequestResults,
      votesLeft: user.maxVotesPerRound - totalVotes,
      duration: endTime - startTime,
      processedTime: endTime,
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
