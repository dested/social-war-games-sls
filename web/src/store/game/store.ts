import {ActionRoute, EntityAction, EntityDetails, GameEntity, PlayableFactionId} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameResource} from '@swg-common/game/gameResource';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {VoteResult} from '@swg-common/game/voteResult';
import {Grid, PointHashKey} from '@swg-common/hex/hex';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {RoundState} from '@swg-common/models/roundState';
import {DoubleHashArray} from '@swg-common/utils/hashArray';
import {Point} from '@swg-common/utils/hexUtils';
import {action, observable} from 'mobx';
import {DataService} from '../../dataServices';
import {loadEntities, loadUI} from '../../drawing/gameAssets';
import {GameRenderer} from '../../drawing/gameRenderer';
import {Drawing, DrawingOptions} from '../../drawing/hexDrawing';
import {SmallGameRenderer} from '../../drawing/smallGameRenderer';
import {HexConstants} from '../../utils/hexConstants';
import {HexImages} from '../../utils/hexImages';
import {SocketUtils} from '../../utils/socketUtils';
import {UIConstants} from '../../utils/uiConstants';
import {mainStore} from '../main/store';

export class GameStore {
  @observable game?: GameModel;
  @observable roundState?: RoundState;
  @observable localRoundState?: RoundState;
  @observable selectedResource?: GameResource;
  @observable userDetails?: UserDetails;
  @observable selectedEntity?: GameEntity;
  @observable selectedEntityAction?: EntityAction;
  @observable viableHexIds?: {[hexId: string]: boolean};
  @observable imagesLoading?: number;
  @observable isVoting?: boolean;
  @observable votingResultError?: VoteResult;
  @observable gameRenderer?: GameRenderer;
  @observable smallGameRenderer?: SmallGameRenderer;
  @observable localVotes: (ProcessedVote & {processedTime: number})[] = [];
  @observable gameReady?: boolean;
  @observable layout?: GameLayout;
  @observable lastRoundActions?: ActionRoute[] = [];
  @observable currentGameId: string;

  @action selectEntity(entity: GameEntity) {
    this.selectedEntity = entity;
    this.selectedResource = undefined;
    this.selectedEntityAction = undefined;
    this.viableHexIds = undefined;
  }

  @action updateGame(game: GameModel, roundState: RoundState, localRoundState: RoundState) {
    this.game = game;
    this.roundState = roundState;
    this.localRoundState = localRoundState;
  }

  @action setCurrentGameId(gameId: string) {
    localStorage.setItem('gameId', gameId);
    this.currentGameId = gameId;
  }

  @action setGameRenderer(gameRenderer: GameRenderer, smallGameRenderer: SmallGameRenderer) {
    this.gameRenderer = gameRenderer;
    this.smallGameRenderer = smallGameRenderer;
  }

  @action addLocalVote(vote: ProcessedVote & {processedTime: number}) {
    this.localVotes = [...this.localVotes, vote];
  }

  @action resetLocalVotes() {
    this.localVotes = [];
  }

  @action removeLocalVote(vote: ProcessedVote) {
    const localVotes = [...this.localVotes];
    localVotes.splice(
      localVotes.findIndex((a) => a.hexId === vote.hexId && a.entityId === vote.entityId && a.action === vote.action),
      1
    );
    this.localVotes = localVotes;
  }

  @action updateUserDetails(userDetails: UserDetails) {
    this.userDetails = userDetails;
  }

  @action setImagesLoading(imagesLoading: number) {
    this.imagesLoading = imagesLoading;
  }

  @action voting(isVoting: boolean) {
    this.isVoting = isVoting;
    this.votingResultError = null;
  }

  @action votingError(votingResultError: VoteResult | null) {
    this.votingResultError = votingResultError;
  }

  @action setGameReady() {
    this.gameReady = true;
  }

  @action setGameLayout(layout: GameLayout) {
    this.layout = layout;
  }

  @action setEntityAction(entity: GameEntity, entityAction: EntityAction, viableHexIds: {[hexId: string]: boolean}) {
    this.selectedEntity = entity;
    this.selectedEntityAction = entityAction;
    this.viableHexIds = viableHexIds;
  }

  @action setLastRoundActions(actions: ActionRoute[]) {
    this.lastRoundActions = actions;
  }
  @action selectResource(resource: GameResource) {
    this.selectedResource = resource;
    this.selectedEntity = undefined;
    this.selectedEntityAction = undefined;
    this.viableHexIds = undefined;
  }

  @action setLastRoundActionsFromNotes(gameState: GameState, factionId: PlayableFactionId, grid: Grid<GameHexagon>) {
    // todo: make this faster.
    if (gameState && gameState.notes) {
      const hexIdParse = /(-?\d*)-(-?\d*)/;
      const route: ActionRoute[] = [];

      for (const note of gameState.notes[factionId]) {
        if (!note.toHexId) {
          continue;
        }
        const fromHexId = hexIdParse.exec(note.fromHexId);
        const fromHex = grid.getHexAt({x: parseInt(fromHexId[1]), y: parseInt(fromHexId[2])});

        const toHexId = hexIdParse.exec(note.toHexId);
        const toHex = grid.getHexAt({x: parseInt(toHexId[1]), y: parseInt(toHexId[2])});

        const path = note.path;
        for (let i = 0; i < path.length - 1; i++) {
          const p1 = path[i];
          const p2 = path[i + 1];
          const hexCoordsP1 = hexIdParse.exec(p1);
          const hexP1 = grid.getHexAt({x: parseInt(hexCoordsP1[1]), y: parseInt(hexCoordsP1[2])});

          const hexCoordsP2 = hexIdParse.exec(p2);
          const hexP2 = grid.getHexAt({x: parseInt(hexCoordsP2[1]), y: parseInt(hexCoordsP2[2])});

          route.push({
            generation: gameState.generation,
            fromHex,
            toHex,
            x1: hexP1.center.x,
            y1: hexP1.center.y,
            x2: hexP2.center.x,
            y2: hexP2.center.y,
            action: note.action,
          });
        }
      }
      gameStore.setLastRoundActions(route);
    }
  }

  static processRoundState(game: GameModel, roundState: RoundState) {
    const localRoundState: RoundState = JSON.parse(JSON.stringify(roundState));

    for (const processedVote of gameStore.localVotes) {
      if (processedVote.processedTime < localRoundState.thisUpdateTime) {
        continue;
      }

      if (!localRoundState.entities[processedVote.entityId]) {
        localRoundState.entities[processedVote.entityId] = [];
      }
      const vote = localRoundState.entities[processedVote.entityId].find(
        (a) => a.hexId === processedVote.hexId && a.action === a.action
      );
      if (vote) {
        vote.count++;
      } else {
        localRoundState.entities[processedVote.entityId].push({
          action: processedVote.action,
          count: 1,
          hexId: processedVote.hexId,
        });
      }
    }
    gameStore.updateGame(game, roundState, localRoundState);
  }

  static async startGame() {
    this.startLoading();
    let layout: GameLayout;
    try {
      layout = await DataService.getLayout();
      gameStore.setGameLayout(layout);
    } catch (ex) {
      console.error(ex);
      gameStore.setCurrentGameId(undefined);
      window.location.reload();
      return;
    }
    const userDetails = await DataService.currentUserDetails();
    gameStore.updateUserDetails(userDetails);

    const gameState = await DataService.getGameState(
      mainStore.user.factionId,
      userDetails.generation,
      userDetails.factionToken
    );
    SocketUtils.connect(gameState.gameId, mainStore.user.id, mainStore.user.factionId, (roundState) => {
      GameStore.getNewState(roundState).catch((ex) => console.error(ex));
    });
    const game = GameLogic.buildGameFromState(layout, gameState);

    HexConstants.smallHeight = (UIConstants.miniMapHeight() / game.grid.boundsHeight) * 1.3384;
    HexConstants.smallWidth = UIConstants.miniMapWidth() / game.grid.boundsWidth;

    DrawingOptions.defaultSmall = {
      width: HexConstants.smallWidth,
      height: HexConstants.smallHeight,
      size: HexConstants.smallHeight / 2 - 1,
      orientation: Drawing.Orientation.PointyTop,
    };

    Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
    gameStore.setLastRoundActionsFromNotes(gameState, mainStore.user.factionId, game.grid);

    const emptyRoundState = {
      nextUpdateTime: 0,
      nextGenerationTick: game.roundEnd,
      thisUpdateTime: 0,
      generation: game.generation,
      entities: {},
    };

    gameStore.updateGame(game, {...emptyRoundState}, {...emptyRoundState});

    gameStore.smallGameRenderer.forceRender();

    gameStore.setGameReady();
  }

  private static async getNewState(roundState: RoundState) {
    if (roundState.generation !== gameStore.game.generation) {
      gameStore.selectEntity(null);
      gameStore.resetLocalVotes();
      const userDetails = await DataService.currentUserDetails();
      gameStore.updateUserDetails(userDetails);

      const gameState = await DataService.getGameState(
        mainStore.user.factionId,
        userDetails.generation,
        userDetails.factionToken
      );

      const game = GameLogic.buildGameFromState(gameStore.layout, gameState);
      Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
      gameStore.smallGameRenderer.processMiniMap(game);
      gameStore.setLastRoundActionsFromNotes(gameState, mainStore.user.factionId, game.grid);
      this.processRoundState(game, roundState);
    } else {
      this.processRoundState(gameStore.game, roundState);
    }
  }

  static startLoading() {
    loadEntities();
    loadUI();
    HexagonTypes.preloadTypes().map((a) => HexImages.hexTypeToImage(a.type, a.subType));
  }

  static async sendVote(entityId: number, entityAction: EntityAction, hexId: string) {
    const {game, roundState} = gameStore;
    gameStore.selectEntity(null);

    const votesLeft = gameStore.userDetails.maxVotes - gameStore.userDetails.voteCount;
    if (votesLeft === 0) {
      return;
    }

    const processedVote = {
      entityId,
      action: entityAction,
      hexId,
      factionId: mainStore.user.factionId,
    };
    const voteResult = GameLogic.validateVote(game, processedVote);

    if (voteResult !== VoteResult.Success) {
      gameStore.votingError(voteResult);
      setTimeout(() => {
        gameStore.votingError(null);
      }, 3000);
      return;
    }

    gameStore.voting(true);
    gameStore.addLocalVote({...processedVote, processedTime: Number.MAX_VALUE});
    this.processRoundState(game, roundState);

    const generation = game.generation;

    try {
      const serverVoteResult = await DataService.vote({
        entityId,
        action: entityAction,
        hexId,
        generation,
      });

      if (serverVoteResult.reason !== 'ok') {
        gameStore.removeLocalVote(processedVote);
        this.processRoundState(game, roundState);
        gameStore.votingError(serverVoteResult.voteResult || VoteResult.Error);
        setTimeout(() => {
          gameStore.votingError(null);
        }, 3000);
      } else {
        gameStore.removeLocalVote(processedVote);
        gameStore.addLocalVote({...processedVote, processedTime: serverVoteResult.processedTime});
        this.processRoundState(game, roundState);

        gameStore.updateUserDetails({
          ...gameStore.userDetails,
          voteCount: gameStore.userDetails.maxVotes - serverVoteResult.votesLeft,
        });
      }

      gameStore.voting(false);
    } catch (ex) {
      console.error(ex);
      gameStore.voting(false);
      gameStore.votingError(VoteResult.Error);
      setTimeout(() => {
        gameStore.votingError(null);
      }, 3000);
    }
  }

  static startEntityAction(entity: GameEntity, entityAction: EntityAction) {
    const game = gameStore.game;
    let radius = 0;
    const entityDetails = EntityDetails[entity.entityType];
    const entityHex = game.grid.hexes.get(entity);
    let entityHash: DoubleHashArray<GameEntity, Point, {id: number}>;

    switch (entityAction) {
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

    switch (entityAction) {
      case 'attack':
        /*    viableHexes = viableHexes.filter(a =>
                      game.entities.find(e => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
                  );*/
        break;
      case 'move':
        viableHexes = viableHexes.filter((a) => !game.entities.get1(a));
        break;
      case 'mine':
        viableHexes = viableHexes.filter((a) => !game.entities.get1(a));
        break;
      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane':
        viableHexes = viableHexes.filter((a) => !game.entities.get1(a));
        break;
    }

    gameStore.setEntityAction(
      entity,
      entityAction,
      viableHexes.reduce((a, b) => {
        a[b.id] = true;
        return a;
      }, {} as {[hexId: string]: boolean})
    );
  }

  static selectViableHex(hex: GameHexagon) {
    this.sendVote(gameStore.selectedEntity.id, gameStore.selectedEntityAction, hex.id);
    gameStore.selectEntity(null);
  }
}

export const gameStore = new GameStore();
export type GameStoreProps = {gameStore?: GameStore};
export const GameStoreName = 'gameStore';

{
  const gameId = localStorage.getItem('gameId');
  if (gameId) {
    gameStore.setCurrentGameId(gameId);
  }
}
