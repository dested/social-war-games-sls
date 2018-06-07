import { PlayableFactionId} from '../../game/entityDetail';

export interface HttpUser {
    id: string;
    email: string;
    factionId: PlayableFactionId;
    maxVotesPerRound:number;
}