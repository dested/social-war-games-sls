import {FactionId} from '../../game/entityDetail';

export interface HttpUser {
    id: string;
    email: string;
    factionId: FactionId;
    maxVotesPerRound:number;
}