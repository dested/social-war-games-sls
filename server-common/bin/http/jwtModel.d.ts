import { FactionId } from 'swg-common/bin/game';
export interface JwtModel {
    userId: string;
    factionId: FactionId;
    maxVotesPerRound: number;
}
