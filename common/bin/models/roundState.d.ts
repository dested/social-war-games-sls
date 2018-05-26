import { EntityAction } from '../game';
export declare type RoundState = {
    hash: string;
    nextUpdate: number;
    entities: {
        [id: string]: RoundStateEntityVote[];
    };
};
export declare type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
