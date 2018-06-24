import {PlayableFactionId} from '../game/entityDetail';

export interface VoteNote {
    note: string;
    fromEntityId: number;
    factionId: PlayableFactionId;
    toEntityId?: number;
    toHexId: string;
    fromHexId: string;
    voteCount: number;
}
