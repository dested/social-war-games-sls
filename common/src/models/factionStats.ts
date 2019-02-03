import {PlayableFactionId} from '../game/entityDetail';

export type FactionStats = {[faction in PlayableFactionId]: FactionStat};

export interface FactionStat {
  c: number; // hexCount
  p: number; // hexPercent
  r: number; // resourceCount
  s: number; // score
}
