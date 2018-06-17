export interface VoteNote {
    note: string;
    fromEntityId: number;
    factionId: string;
    toEntityId: number;
    toHexId: string;
    fromHexId: string;
    voteCount: number;
}
