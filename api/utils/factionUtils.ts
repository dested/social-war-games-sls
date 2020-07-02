import {PlayableFactionId} from '@swg-common/game/entityDetail';

export class FactionUtils {
  static randomFaction(): PlayableFactionId {
    return (Math.floor(Math.random() * 3) + 1) as PlayableFactionId;
  }
}
