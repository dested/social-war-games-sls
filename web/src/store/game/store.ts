import {ActionRoute, EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameResource} from '@swg-common/game/gameResource';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {VoteResult} from '@swg-common/game/voteResult';
import {PointHashKey} from '@swg-common/hex/hex';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {RoundState} from '@swg-common/models/roundState';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import {DoubleHashArray} from '@swg-common/utils/hashArray';
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
import {Point} from '@swg-common/utils/hexUtils';

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
  @observable gameState?: GameState;
  @observable gameReady?: boolean;
  @observable layout?: GameLayout;
  @observable lastRoundActions?: ActionRoute[] = [];

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
      localVotes.findIndex(a => a.hexId === vote.hexId && a.entityId === vote.entityId && a.action === vote.action),
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
    this.votingError = null;
  }

  @action votingError(votingResultError: VoteResult | null) {
    this.votingResultError = votingResultError;
  }

  @action setGameState(gameState: GameState) {
    this.gameState = gameState;
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

  @action setLastRoundActionsFromNotes(factionRoundStats: FactionRoundStats, oldGame: GameModel, game: GameModel) {
    if (factionRoundStats && factionRoundStats.notes) {
      const grid = game.grid;
      const hexIdParse = /(-?\d*)-(-?\d*)/;
      const route: ActionRoute[] = gameStore.lastRoundActions.filter(a => a.generation > factionRoundStats.generation);

      for (const note of factionRoundStats.notes) {
        if (!note.toHexId) {
          continue;
        }
        const fromHexId = hexIdParse.exec(note.fromHexId);
        const fromHex = grid.getHexAt({x: parseInt(fromHexId[1]), y: parseInt(fromHexId[2])});

        const toHexId = hexIdParse.exec(note.toHexId);
        const toHex = grid.getHexAt({x: parseInt(toHexId[1]), y: parseInt(toHexId[2])});

        const entityHash = GameLogic.getEntityHash(note.action, oldGame);
        const path = game.grid.findPath(fromHex, toHex, entityHash);
        for (let i = 0; i < path.length - 1; i++) {
          const f = path[i];
          const t = path[i + 1];
          route.push({
            generation: factionRoundStats.generation,
            fromHex,
            toHex,
            x1: f.center.x,
            y1: f.center.y,
            x2: t.center.x,
            y2: t.center.y,
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
        a => a.hexId === processedVote.hexId && a.action === a.action
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

    const layout = await DataService.getLayout();
    gameStore.setGameLayout(layout);

    const userDetails = await DataService.currentUserDetails();
    gameStore.updateUserDetails(userDetails);

    const localGameState = await DataService.getGameState(mainStore.user.factionId, userDetails.factionToken);
    gameStore.setGameState(localGameState);
    SocketUtils.connect(mainStore.user.id, mainStore.user.factionId, roundState => {
      GameStore.getNewState(roundState).catch(ex => console.error(ex));
    });
    // const roundState = await DataService.getRoundState(mainStore.user.factionId);
    const game = GameLogic.buildGameFromState(layout, localGameState);

    HexConstants.smallHeight = ((UIConstants.miniMapHeight() - 100) / game.grid.boundsHeight) * 1.3384;
    HexConstants.smallWidth = UIConstants.miniMapWidth() / game.grid.boundsWidth;

    DrawingOptions.defaultSmall = {
      width: HexConstants.smallWidth,
      height: HexConstants.smallHeight,
      size: HexConstants.smallHeight / 2 - 1,
      orientation: Drawing.Orientation.PointyTop,
    };

    Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);

    const emptyRoundState = {
      nextUpdateTime: 0,
      nextGenerationTick: game.roundEnd,
      thisUpdateTime: 0,
      generation: game.generation,
      entities: {},
    };
    gameStore.updateGame(game, emptyRoundState, emptyRoundState);

    gameStore.smallGameRenderer.forceRender();

    gameStore.setGameReady();
  }

  private static async getNewState(roundState: RoundState) {
    let oldGame = gameStore.game;
    if (roundState.generation !== gameStore.game.generation) {
      gameStore.selectEntity(null);
      gameStore.resetLocalVotes();
      const userDetails = await DataService.currentUserDetails();
      gameStore.updateUserDetails(userDetails);

      const localGameState = await DataService.getGameState(mainStore.user.factionId, userDetails.factionToken);

      const game = GameLogic.buildGameFromState(gameStore.layout, localGameState);
      Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
      gameStore.smallGameRenderer.processMiniMap(game);
      const factionRoundStats = await DataService.getFactionRoundStats(game.generation - 1, mainStore.user.factionId);
      gameStore.setLastRoundActionsFromNotes(factionRoundStats, oldGame, game);
      oldGame = game;
    }

    this.processRoundState(oldGame, roundState);
  }

  static startLoading() {
    loadEntities();
    loadUI();
    HexagonTypes.preloadTypes().map(a => HexImages.hexTypeToImage(a.type, a.subType));
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

    switch (entityAction) {
      case 'attack':
        /*    viableHexes = viableHexes.filter(a =>
                      game.entities.find(e => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
                  );*/
        break;
      case 'move':
        viableHexes = viableHexes.filter(a => !game.entities.get1(a));
        break;
      case 'mine':
        viableHexes = viableHexes.filter(a => !game.entities.get1(a));
        break;
      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane':
        viableHexes = viableHexes.filter(a => !game.entities.get1(a));
        break;
    }

    gameStore.setEntityAction(
      entity,
      entityAction,
      viableHexes.reduce(
        (a, b) => {
          a[b.id] = true;
          return a;
        },
        {} as {[hexId: string]: boolean}
      )
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
