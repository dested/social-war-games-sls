export interface VoteNote {
    note: string;
    fromEntityId: string;
    factionId: string;
    toEntityId: string;
    toHexId: string;
    fromHexId: string;
    voteCount: number;
}
