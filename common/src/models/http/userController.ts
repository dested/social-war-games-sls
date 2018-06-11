import {HttpUser} from './httpUser';
import {DBUserRoundStatDetails} from '../../../../server-common/src/db/models/dbUserRoundStats';

export interface RegisterRequest {
    email: string;
    userName: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface JwtGetUserResponse extends GetUserResponse {
    jwt: string;
}

export interface GetUserResponse {
    user: HttpUser;
}

export interface StatsResponse {
    roundsParticipated: DBUserRoundStatDetails[];
}

export interface LadderResponse {
    ladder: {rank: number; score: number; _id: string; userName: string}[];
}
