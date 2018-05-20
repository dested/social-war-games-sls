import {HttpUser} from './httpUser';

export interface RegisterRequest {
    email: string;
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
    foo: boolean;
}
