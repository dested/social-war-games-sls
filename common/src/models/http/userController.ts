import {DBUserRoundStatDetails} from '@swg-server-common/db/models/dbUserRoundStats';
import {HttpUser} from './httpUser';

export interface RegisterRequestBody {
  email: string;
  userName: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface JwtGetUserResponse extends GetUserResponse {
  jwt: string;
}

export interface GetUserResponse {
  user: HttpUser;
  time: string;
}

export interface StatsResponse {
  roundsParticipated: DBUserRoundStatDetails[];
}

export interface LadderResponse {
  ladder: {rank: number; score: number; _id: string; userName: string}[];
}
