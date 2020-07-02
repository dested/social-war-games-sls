import {Event} from '../utils/models';
import {DBGame} from '@swg-server-common/db/models/dbGame';
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
import {SwgRemoteStore} from 'swg-server-common/src/redis/swgRemoteStore';

export async function roundUpdateHandler(event: Event<void>): Promise<void> {
  const {gameId} = await DBGame.db.getOneProject({}, {gameId: 1});
  await processRoundUpdate(gameId);
}

let gameState: GameState;
let layout: GameLayout;

async function processRoundUpdate(gameId: string) {
  try {
    console.time('round update');
    console.log('update round state');
    gameState = gameState || (await SwgRemoteStore.getGameState(gameId));
    if (gameState.generation !== (await SwgRemoteStore.getGameGeneration(gameId))) {
      gameState = await SwgRemoteStore.getGameState(gameId);
    }
    layout = layout || (await SwgRemoteStore.getGameLayout(gameId));

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
