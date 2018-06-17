import {EntityAction} from '../game/entityDetail';

export type RoundState = {
    thisUpdateTime: number;
    generation: number;
    entities: {[id: string]: RoundStateEntityVote[]};
};
export type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
