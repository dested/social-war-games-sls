import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameLayout, GameLayoutSchemaGenerator} from '@swg-common/models/gameLayout';
import {GameState, GameStateSchemaGenerator} from '@swg-common/models/gameState';
import {PlayableFactionId} from '@swg-common/game/entityDetail';
import {Config} from '@swg-server-common/config';

export class SwgRemoteStore {
  static async getGameLayout(gameId: string) {
    const buffer = await RedisManager.getBinary(gameId, 'layout');
    return GameLayoutSchemaGenerator.fromBuffer(buffer);
  }
  static async setGameLayout(gameId: string, gameLayout: GameLayout) {
    await RedisManager.setBinary(gameId, `layout`, GameLayoutSchemaGenerator.toBuffer(gameLayout));
  }

  static async getGameState(gameId: string) {
    return GameStateSchemaGenerator.fromBuffer(await RedisManager.getBinary(gameId, 'game-state'));
  }
  static async setGameState(gameId: string, gameState: GameState) {
    await RedisManager.setBinary(gameId, `game-state`, GameStateSchemaGenerator.toBuffer(gameState));
  }

  static async getStop(gameId: string) {
    return await RedisManager.get(gameId, 'stop');
  }
  static async setStop(gameId: string, value: boolean) {
    await RedisManager.set(gameId, 'stop', value);
  }

  static async getGameGeneration(gameId: string) {
    return RedisManager.get<number>(gameId, 'game-generation');
  }

  static async setGameGeneration(gameId: string, generation: number) {
    await RedisManager.set<number>(gameId, 'game-generation', generation);
  }

  static async flushAll() {
    await RedisManager.flushAll();
  }

  static async setFactionToken(gameId: string, generation: number, faction: PlayableFactionId, factionToken: any) {
    await RedisManager.setString(gameId, `faction-token-${generation}-${faction}`, factionToken);
  }

  static async setUserVotes(gameId: string, userId: any, generation: number, totalVotes: number) {
    await RedisManager.set(gameId, `user-${userId}-${generation}-votes`, totalVotes);
    await RedisManager.expire(gameId, `user-${userId}-${generation}-votes`, Config.gameDuration * 2);
  }

  static async getUserVotes(gameId: string, userId: any, generation: number) {
    return RedisManager.get<number>(gameId, `user-${userId}-${generation}-votes`, 0);
  }

  static async getUserVotesHex(gameId: string, userId: any, generation: number) {
    return RedisManager.getString(gameId, `user-${userId}-${generation}-vote-hex`, '');
  }

  static async appendUserVotesHex(gameId: string, userId: any, generation: number, entityId: number) {
    await RedisManager.append(gameId, `user-${userId}-${generation}-vote-hex`, `${entityId} `);
    await RedisManager.expire(gameId, `user-${userId}-${generation}-vote-hex`, Config.gameDuration * 2);
  }

  static async getFactionToken(gameId: string, generation: number, factionId: PlayableFactionId) {
    return RedisManager.getString(gameId, `faction-token-${generation}-${factionId}`);
  }
}
