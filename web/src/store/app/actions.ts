import {HttpUser} from '@swg-common/models/http/httpUser';

export enum AppActionOptions {
    SetJWT = 'SET_JWT',
    SetUser = 'SET_USER',
    Logout = 'LOGOUT'
}
export interface SetJWTAction {
    type: AppActionOptions.SetJWT;
    jwt: string;
}

export interface SetUserAction {
    type: AppActionOptions.SetUser;
    user: HttpUser;
}

export interface LogoutAction {
    type: AppActionOptions.Logout;
}

export type AppAction = SetJWTAction | SetUserAction | LogoutAction;

export class AppActions {
    static setJWT(jwt: string): SetJWTAction {
        return {
            type: AppActionOptions.SetJWT,
            jwt
        };
    }
    static setUser(user: HttpUser): SetUserAction {
        return {
            type: AppActionOptions.SetUser,
            user
        };
    }

    static logout(): LogoutAction {
        return {
            type: AppActionOptions.Logout
        };
    }
}
