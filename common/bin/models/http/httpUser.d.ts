import { FactionId } from '../../game';
export interface HttpUser {
    id: string;
    email: string;
    factionId: FactionId;
    maxVotesPerRound: number;
}
