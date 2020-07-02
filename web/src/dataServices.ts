import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {FactionStats} from '@swg-common/models/factionStats';
import {GameState, GameStateSchemaReaderFunction} from '@swg-common/models/gameState';
import {HttpGame} from '@swg-common/models/http/httpGame';
import {JwtGetUserResponse, LadderResponse} from '@swg-common/models/http/userController';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResponse} from '@swg-common/models/http/voteResults';
import {gameStore} from './store/game/store';
import {mainStore} from './store/main/store';
import {SchemaDefiner} from '@swg-common/schemaDefiner/schemaDefiner';
import {GameLayoutSchemaReaderFunction} from '@swg-common/models/gameLayout';

export class Config {
  static env: 'LOCAL' | 'PROD' = 'LOCAL';

  static apiServer = Config.env === 'LOCAL' ? 'http://localhost:5103' : 'https://api.socialwargames.com';
  static s3Server =
    Config.env === 'LOCAL' ? 'http://localhost:4569/swg-games' : 'https://s3-us-west-2.amazonaws.com/swg-games';
  static socketServer = Config.env === 'LOCAL' ? 'ws://127.0.0.1:3001' : 'wss://ws.socialwargames.com';
}

export class DataService {
  static async login(email: string, password: string): Promise<JwtGetUserResponse> {
    const response = await fetch(`${Config.apiServer}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // or check for response.status
      throw new Error(response.statusText);
    }
    const json = await response.json();
    if (response.status === 200) {
      return json;
    } else {
      throw new Error();
    }
  }

  static async register(email: string, userName: string, password: string): Promise<JwtGetUserResponse> {
    const response = await fetch(`${Config.apiServer}/register`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        userName,
        password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // or check for response.status
      throw new Error(response.statusText);
    }
    const json = await response.json();
    if (response.status === 200) {
      return json;
    } else {
      throw new Error();
    }
  }

  static async vote(vote: {
    entityId: number;
    action: EntityAction;
    generation: number;
    hexId: string;
  }): Promise<VoteResponse> {
    const response = await fetch(`${Config.apiServer}/vote`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + mainStore.jwt,
        gameid: gameStore.currentGameId,
      },
      body: JSON.stringify(vote),
    });
    const json = await response.json();
    return json;
  }

  static async currentUserDetails(): Promise<UserDetails> {
    const response = await fetch(`${Config.apiServer}/user-details`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + mainStore.jwt,
        gameid: gameStore.currentGameId,
      },
    });

    const json = await response.json();
    return json;
  }

  static async getLayout() {
    const gameId = gameStore.currentGameId;
    const response = await fetch(`${Config.s3Server}/${gameId}/layout.swg`, {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream',
        'Content-Type': 'application/octet-stream',
        gameid: gameStore.currentGameId,
      },
    });
    const arrayBuffer = await response.arrayBuffer();
    return SchemaDefiner.startReadSchemaBuffer(arrayBuffer, GameLayoutSchemaReaderFunction);
  }

  static async getGameState(
    factionId: PlayableFactionId,
    generation: number,
    factionToken: string
  ): Promise<GameState> {
    const gameId = gameStore.currentGameId;
    const response = await fetch(
      `${Config.s3Server}/${gameId}/generation-outcomes/generation-outcome-${generation}-${factionId}.swg`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
          'Content-Type': 'application/octet-stream',
        },
      }
    );
    const arrayBuffer = await response.arrayBuffer();
    // todo decrypt with factionToken.split('.').map((a) => parseInt(a))
    const gameState: GameState = SchemaDefiner.startReadSchemaBuffer(arrayBuffer, GameStateSchemaReaderFunction);

    return gameState;
  }

  static async getLadder(): Promise<LadderResponse> {
    const response = await fetch(`${Config.apiServer}/ladder`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(mainStore.jwt ? {Authorization: 'Bearer ' + mainStore.jwt} : {}),
        gameid: gameStore.currentGameId,
      },
    });
    const json = await response.json();
    return json;
  }

  static async getGames(): Promise<{games: HttpGame[]}> {
    const response = await fetch(`${Config.apiServer}/games`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(mainStore.jwt ? {Authorization: 'Bearer ' + mainStore.jwt} : {}),
      },
    });
    const json = await response.json();
    return json;
  }

  static async getFactionStats(generation: number): Promise<FactionStats[]> {
    const gameId = gameStore.currentGameId;
    const response = await fetch(`${Config.s3Server}/${gameId}/faction-stats.json?bust=${generation}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
}
