import {EntityAction, PlayableFactionId} from '../game/entityDetail';

export interface VoteNote {
  note: string;
  action: EntityAction;
  fromEntityId: number;
  factionId: PlayableFactionId;
  toEntityId?: number;
  toHexId: string;
  fromHexId: string;
  voteCount: number;
  path: string[];
}
