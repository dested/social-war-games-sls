import {Event} from '../utils/models';
import {DBGame} from '@swg-server-common/db/models/dbGame';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {orderBy, sumBy} from 'lodash';
import {StateManager} from './game/stateManager';
import {S3Splitter} from './game/s3Splitter';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {GameState} from '@swg-common/models/gameState';
import {GameLogic, ProcessedVote} from '@swg-common/game/gameLogic';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {GameLayout} from '@swg-common/models/gameLayout';
import {VoteResult} from '@swg-common/game/voteResult';

export async function roundUpdateHandler(event: Event<void>): Promise<void> {
  const {gameId} = await DBGame.db.getOneProject({}, {gameId: 1});
  await processRoundUpdate(gameId);
}

async function processRoundUpdate(gameId: string) {
  try {
    console.time('round update');
    console.log('update round state');
    const gameState = await RedisManager.get<GameState>(gameId, 'game-state');
    const layout = await RedisManager.get<GameLayout>(gameId, 'layout');

    const game = GameLogic.buildGameFromState(layout, gameState);

    const voteCounts = await DBVote.getVoteCount(gameId, gameState.generation);
    await S3Splitter.output(
      game,
      layout,
      gameState,
      StateManager.buildRoundState(gameState.generation, voteCounts),
      null,
      false
    );
    console.timeEnd('round update');
  } catch (ex) {
    console.error(ex);
  }
}
