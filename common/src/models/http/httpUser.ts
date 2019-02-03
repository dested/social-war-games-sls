import {PlayableFactionId} from '../../game/entityDetail';

export interface HttpUser {
  id: string;
  email: string;
  userName: string;
  factionId: PlayableFactionId;
  maxVotesPerRound: number;
}
