import {EntityAction, EntityDetails, GameEntity, PlayableFactionId} from '@swg-common/game/entityDetail';
import {GameLogic, GameModel} from '@swg-common/game/gameLogic';
import {VoteResult} from '@swg-common/game/voteResult';
import {PointHashKey} from '@swg-common/hex/hex';
import {JwtGetUserResponse} from '@swg-common/models/http/userController';
import {VoteRequestResults} from '@swg-common/models/http/voteResults';
import {DoubleHashArray} from '@swg-common/utils/hashArray';
import {Point} from '@swg-common/utils/hexUtils';
import {Utils} from '@swg-common/utils/utils';
import {DataService} from './dataServices';

let gameId: string;

const startBot = async (userResponse: JwtGetUserResponse) => {
  const layout = await DataService.getLayout(gameId);
  let userDetails = await DataService.currentUserDetails(userResponse.jwt, gameId);
  console.log(userDetails);
  let localGameState = await DataService.getGameState(
    userResponse.user.factionId,
    userDetails.generation,
    userDetails.factionToken,
    gameId
  );

  let game = GameLogic.buildGameFromState(layout, localGameState);
  let votesLeft = userDetails.maxVotes - userDetails.voteCount;
  while (true) {
    try {
      if (votesLeft === 0) {
        const next = localGameState.roundEnd - +new Date();
        console.log('no votes left!');
        await Utils.timeout(next + 5000);

        userDetails = await DataService.currentUserDetails(userResponse.jwt, gameId);
        localGameState = await DataService.getGameState(
          userResponse.user.factionId,
          userDetails.generation,
          userDetails.factionToken,
          gameId
        );
        game = GameLogic.buildGameFromState(layout, localGameState);
        votesLeft = userDetails.maxVotes - userDetails.voteCount;
      }
      const voteResult = await randomAction(game, userResponse.jwt, userResponse.user.factionId);
      votesLeft--;
      if (!voteResult) {
        await Utils.timeout(Math.random() * 10000);
        userDetails = await DataService.currentUserDetails(userResponse.jwt, gameId);
        continue;
      }

      switch (voteResult.reason) {
        case 'ok':
          console.log('voted', userResponse.user.email);
          await Utils.timeout(Math.random() * 500);
          continue;
        case 'max_votes':
          console.log('max votes', userResponse.user.email);
          await Utils.timeout(10000);
          break;
        case 'stopped':
          console.log('stopped', userResponse.user.email);
          await Utils.timeout(1000);
          userDetails = await DataService.currentUserDetails(userResponse.jwt, gameId);
          localGameState = await DataService.getGameState(
            userResponse.user.factionId,
            userDetails.generation,
            userDetails.factionToken,
            gameId
          );
          game = GameLogic.buildGameFromState(layout, localGameState);
          break;
        case 'bad_generation':
          // await Utils.timeout(1000);
          userDetails = await DataService.currentUserDetails(userResponse.jwt, gameId);
          localGameState = await DataService.getGameState(
            userResponse.user.factionId,
            userDetails.generation,
            userDetails.factionToken,
            gameId
          );
          game = GameLogic.buildGameFromState(layout, localGameState);
          continue;
      }
      // await Utils.timeout(Math.random() * 10000);
    } catch (ex) {
      console.error(ex);
    }
  }
};

async function register(ind: number) {
  const email = `test-${ind}@test.com`;
  const password = `test`;
  const userName = `Test ${ind}`;

  try {
    const userResponse = await DataService.register(email, userName, password);
    startBot(userResponse);
  } catch (ex) {
    console.error(ex);
  }
}

async function login(email: string, password: string) {
  try {
    console.log('logging in', email);
    const userResponse = await DataService.login(email, password);
    console.log('logged in', email, userResponse.time);
    startBot(userResponse);
  } catch (ex) {
    console.error('login', ex);
  }
}

async function randomAction(
  game: GameModel,
  jwt: string,
  factionId: PlayableFactionId
): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
  let result = await randomAttack(game, jwt, factionId);
  if (!result) {
    result = await randomMine(game, jwt, factionId);
  }
  if (!result && Utils.random(5)) {
    result = await randomSpawn(game, jwt, factionId);
  }
  if (!result) {
    result = await randomMove(game, jwt, factionId);
  }
  return result;
}

async function randomMove(
  game: GameModel,
  jwt: string,
  factionId: PlayableFactionId
): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
  const entity = Utils.randomElement(
    game.entities.array.filter(a => a.factionId === factionId && a.entityType !== 'factory')
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
    const serverVoteResult = await DataService.vote(processedVote, jwt, gameId);
    return serverVoteResult;
  } else {
    return {
      voteResult,
      reason: 'error',
      processedTime: 0,
      votesLeft: 0,
    };
  }
}

async function randomAttack(
  game: GameModel,
  jwt: string,
  factionId: PlayableFactionId
): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
  const entity = Utils.randomElement(
    game.entities.array.filter(a => a.factionId === factionId && a.entityType !== 'factory')
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
    const serverVoteResult = await DataService.vote(processedVote, jwt, gameId);
    return serverVoteResult;
  } else {
    return {
      voteResult,
      reason: 'error',
      processedTime: 0,
      votesLeft: 0,
    };
  }
}

async function randomMine(
  game: GameModel,
  jwt: string,
  factionId: PlayableFactionId
): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
  const entity = Utils.randomElement(
    game.entities.array.filter(a => a.factionId === factionId && a.entityType === 'infantry' && !a.busy)
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
    const serverVoteResult = await DataService.vote(processedVote, jwt, gameId);
    return serverVoteResult;
  } else {
    return {
      voteResult,
      reason: 'error',
      processedTime: 0,
      votesLeft: 0,
    };
  }
}

async function randomSpawn(
  game: GameModel,
  jwt: string,
  factionId: PlayableFactionId
): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
  const entity = Utils.randomElement(
    game.entities.array.filter(a => a.factionId === factionId && a.entityType === 'factory' && !a.busy)
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
    const serverVoteResult = await DataService.vote(processedVote, jwt, gameId);
    return serverVoteResult;
  } else {
    return {
      voteResult,
      reason: 'error',
      processedTime: 0,
      votesLeft: 0,
    };
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
      entityHash = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id);
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
      viableHexes = viableHexes.filter(a =>
        game.entities.find(e => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
      );
      break;
    case 'move':
      viableHexes = viableHexes.filter(a => !game.entities.get1(a));
      break;
    case 'mine':
      viableHexes = viableHexes.filter(a => game.resources.find(e => e.x === a.x && e.y === a.y));
      break;
    case 'spawn-infantry':
    case 'spawn-tank':
    case 'spawn-plane':
      viableHexes = viableHexes.filter(a => !game.entities.get1(a));
      break;
  }
  return viableHexes;
}

async function start() {
  const response = await DataService.getGames();
  gameId = response.games[0].gameId;

  const startNum = parseInt(process.argv[2]) * 100;
  for (let i = startNum; i < startNum + 100; i += 10) {
    // login(`test-${i}@test.com`, 'test').catch(ex => console.error(ex));
    await Promise.all([
      login(`test-${i}@test.com`, `test`),
      login(`test-${i + 1}@test.com`, `test`),
      login(`test-${i + 2}@test.com`, `test`),
      login(`test-${i + 3}@test.com`, `test`),
      login(`test-${i + 4}@test.com`, `test`),
      login(`test-${i + 5}@test.com`, `test`),
      login(`test-${i + 6}@test.com`, `test`),
      login(`test-${i + 7}@test.com`, `test`),
      login(`test-${i + 8}@test.com`, `test`),
      login(`test-${i + 9}@test.com`, `test`),
    ]);
  }
}
start().catch(ex => console.error(ex));
