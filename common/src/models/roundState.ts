import {EntityAction} from '../game';

export type RoundState = {
    hash: string;
    nextUpdate:number;
    entities: {[id: string]: RoundStateEntityVote[]};
};
export type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
