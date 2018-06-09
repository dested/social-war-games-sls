import {PlayableFactionId} from '../game/entityDetail';

export type FactionStats = {[faction in PlayableFactionId]: FactionStat};

export interface FactionStat {
    hexCount: number;
    hexPercent: number;
    resourceCount: number;
    score: number;
}
