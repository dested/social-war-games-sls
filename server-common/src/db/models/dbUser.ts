import {PlayableFactionId} from '@swg-common/game/entityDetail';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';

export class DBUser extends MongoDocument {
  static collectionName = 'swg-user';
  static db = new DocumentManager<DBUser>(DBUser.collectionName);

  email: string;
  userName: string;
  passwordHash: string;
  maxVotesPerRound: number;
  factionId: PlayableFactionId;
  createdDate: Date;

  static map(e: DBUser): HttpUser {
    return {
      id: e._id.toHexString(),
      email: e.email,
      userName: e.userName,
      factionId: e.factionId,
      maxVotesPerRound: e.maxVotesPerRound,
    };
  }
}
