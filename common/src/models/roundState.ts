import {EntityAction} from '../game/entityDetail';

export type RoundState = {
    hash: string;
    nextUpdateTime:number;
    thisUpdateTime:number;
    generation:number;
    entities: {[id: string]: RoundStateEntityVote[]};
};
export type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
