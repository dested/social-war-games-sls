import {EntityAction} from '../game/entityDetail';

export type RoundState = {
    thisUpdateTime: number;
    generation: number;
    entities: {[id: number]: RoundStateEntityVote[]};
};
export type RoundStateEntityVote = {
    action: EntityAction;
    hexId: string;
    count: number;
};
