import {EntityAction} from '../game/entityDetail';

export interface RoundState {
    thisUpdateTime: number;
    generation: number;
    entities: {[id: number]: RoundStateEntityVote[]};
}
export interface RoundStateEntityVote {
    action: EntityAction;
    hexId: string;
    count: number;
}
