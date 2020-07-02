import {setupHandler} from './functions/setup';
import {workHandler} from './functions/work';
import {roundUpdateHandler} from './functions/roundUpdate';
import {SchemaDefiner} from 'swg-common/src/schemaDefiner/schemaDefiner';
import {customSchemaTypes} from 'swg-common/src/models/customSchemaTypes';
import {GameState, GameStateSchema} from 'swg-common/src/models/gameState';
import {voteHandler, VoteRequestBody} from './functions/vote';
import {GameLogic, GameModel} from 'swg-common/src/game/gameLogic';
import {GameLayout} from 'swg-common/src/models/gameLayout';
import {RedisManager} from 'swg-server-common/src/redis/redisManager';
import {DBGame} from 'swg-server-common/src/db/models/dbGame';
import {loginHandler} from './functions/login';
import {JwtGetUserResponse} from 'swg-common/src/models/http/userController';
import {Utils} from 'swg-common/src/utils/utils';
import {EntityAction, EntityDetails, GameEntity, PlayableFactionId} from 'swg-common/src/game/entityDetail';
import {VoteRequestResults} from 'swg-common/src/models/http/voteResults';
import {VoteResult} from 'swg-common/src/game/voteResult';
import {DoubleHashArray} from 'swg-common/src/utils/hashArray';
import {Point} from 'swg-common/src/utils/hexUtils';
import {PointHashKey} from 'swg-common/src/hex/hex';

async function main() {
  console.log('here');

  const result = await loginHandler({body: {email: 'dested@gmail.com', password: 'testtest'}} as any);
  const loginBody = JSON.parse(result.body) as JwtGetUserResponse;
  const jwt = loginBody.jwt;
  await setupHandler(undefined);
  await workHandler(undefined);
  const {gameId} = await DBGame.db.getOneProject({}, {gameId: 1});
  const game = GameLogic.buildGameFromState(
    await RedisManager.get<GameLayout>(true, gameId, 'layout'),
    await RedisManager.get<GameState>(true, gameId, 'game-state')
  );
  const entity = Utils.randomElement(
    game.entities.array.filter((a) => a.factionId === loginBody.user.factionId && a.entityType === 'infantry')
  );

  for (let i = 0; i < 3; i++) {
    const action = await randomAction(game, loginBody.user.factionId);
    await voteHandler({
      headers: {Authorization: 'Bearer ' + jwt, gameid: gameId} as any,
      httpMethod: '',
      path: '',
      body: action,
    });
  }
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);

  /* debugger;
  const result = SchemaDefiner.startAddSchemaBuffer(
    testGameState,
    GameStateSchemaAdderSizeFunction,
    GameStateSchemaAdderFunction
  );
  console.log(result.byteLength);
  const resultReader: GameState = SchemaDefiner.startReadSchemaBuffer(result, GameStateSchemaReaderFunction);
  console.log(resultReader.factions.length, testGameState.factions.length);

  console.log(JSON.stringify(resultReader));*/
}

main()
  .then((c) => console.log(c))
  .catch((c) => console.log(c));

async function randomAction(game: GameModel, factionId: PlayableFactionId): Promise<VoteRequestBody> {
  let result = await randomAttack(game, factionId);
  if (!result) {
    result = await randomMine(game, factionId);
  }
  if (!result && Utils.random(5)) {
    result = await randomSpawn(game, factionId);
  }
  if (!result) {
    result = await randomMove(game, factionId);
  }
  return result;
}

async function randomMove(game: GameModel, factionId: PlayableFactionId): Promise<VoteRequestBody> {
  const entity = Utils.randomElement(
    game.entities.array.filter((a) => a.factionId === factionId && a.entityType !== 'factory')
  );

  const viableHexes = getViableHexes(game, entity, 'move' as EntityAction);

  const hex = Utils.randomElement(viableHexes);

  const processedVote = {
    entityId: entity.id,
    factionId: entity.factionId,
    action: 'move' as EntityAction,
    hexId: hex.id,
    generation: game.generation,
  };

  const voteResult = GameLogic.validateVote(game, processedVote);
  if (voteResult === VoteResult.Success) {
    return processedVote;
  } else {
    return undefined;
  }
}

async function randomAttack(game: GameModel, factionId: PlayableFactionId): Promise<VoteRequestBody> {
  const entity = Utils.randomElement(
    game.entities.array.filter((a) => a.factionId === factionId && a.entityType !== 'factory')
  );

  const viableHexes = getViableHexes(game, entity, 'attack' as EntityAction);
  if (viableHexes.length === 0) {
    return null;
  }
  const hex = Utils.randomElement(viableHexes);

  const processedVote = {
    entityId: entity.id,
    factionId: entity.factionId,
    action: 'attack' as EntityAction,
    hexId: hex.id,
    generation: game.generation,
  };

  const voteResult = GameLogic.validateVote(game, processedVote);
  if (voteResult === VoteResult.Success) {
    return processedVote;
  } else {
    return undefined;
  }
}

async function randomMine(game: GameModel, factionId: PlayableFactionId): Promise<VoteRequestBody> {
  const entity = Utils.randomElement(
    game.entities.array.filter((a) => a.factionId === factionId && a.entityType === 'infantry' && !a.busy)
  );
  if (!entity) {
    return null;
  }

  const viableHexes = getViableHexes(game, entity, 'mine' as EntityAction);
  if (viableHexes.length === 0) {
    return null;
  }
  const hex = Utils.randomElement(viableHexes);

  const processedVote = {
    entityId: entity.id,
    factionId: entity.factionId,
    action: 'mine' as EntityAction,
    hexId: hex.id,
    generation: game.generation,
  };

  const voteResult = GameLogic.validateVote(game, processedVote);
  if (voteResult === VoteResult.Success) {
    return processedVote;
  } else {
    return undefined;
  }
}

async function randomSpawn(game: GameModel, factionId: PlayableFactionId): Promise<VoteRequestBody> {
  const entity = Utils.randomElement(
    game.entities.array.filter((a) => a.factionId === factionId && a.entityType === 'factory' && !a.busy)
  );

  if (!entity) {
    return null;
  }

  const spawn = Utils.randomElement(['spawn-infantry', 'spawn-plane', 'spawn-tank']) as EntityAction;
  const viableHexes = getViableHexes(game, entity, spawn);

  if (viableHexes.length === 0) {
    return null;
  }
  const hex = Utils.randomElement(viableHexes);

  const processedVote = {
    entityId: entity.id,
    factionId: entity.factionId,
    action: spawn,
    hexId: hex.id,
    generation: game.generation,
  };

  const voteResult = GameLogic.validateVote(game, processedVote);
  if (voteResult === VoteResult.Success) {
    return processedVote;
  } else {
    return undefined;
  }
}

function getViableHexes(game: GameModel, entity: GameEntity, action: EntityAction) {
  let radius = 0;
  const entityDetails = EntityDetails[entity.entityType];
  const entityHex = game.grid.hexes.get(entity);
  let entityHash: DoubleHashArray<GameEntity, Point, {id: number}>;

  switch (action) {
    case 'attack':
      radius = entityDetails.attackRadius;
      entityHash = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, (e) => e.id);
      break;
    case 'move':
      radius = entityDetails.moveRadius;
      entityHash = game.entities;
      break;
    case 'mine':
      radius = entityDetails.mineRadius;
      entityHash = game.entities;
      break;
    case 'spawn-infantry':
    case 'spawn-tank':
    case 'spawn-plane':
      radius = entityDetails.spawnRadius;
      entityHash = game.entities;
      break;
  }

  let viableHexes = game.grid.getRange(entityHex, radius, entityHash);

  switch (action) {
    case 'attack':
      viableHexes = viableHexes.filter((a) =>
        game.entities.find((e) => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
      );
      break;
    case 'move':
      viableHexes = viableHexes.filter((a) => !game.entities.get1(a));
      break;
    case 'mine':
      viableHexes = viableHexes.filter((a) => game.resources.find((e) => e.x === a.x && e.y === a.y));
      break;
    case 'spawn-infantry':
    case 'spawn-tank':
    case 'spawn-plane':
      viableHexes = viableHexes.filter((a) => !game.entities.get1(a));
      break;
  }
  return viableHexes;
}
