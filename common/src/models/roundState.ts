import {EntityAction} from '../game/entityDetail';

export type RoundState = {
    hash: string;
    nextUpdate:number;
    generation:number;
    entities: {[id: string]: RoundStateEntityVote[]};
};
export type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
