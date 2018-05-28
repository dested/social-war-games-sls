import {FactionId} from '@swg-common/game';

export interface JwtModel {
    userId: string;
    factionId: FactionId;
    maxVotesPerRound: number;
}
