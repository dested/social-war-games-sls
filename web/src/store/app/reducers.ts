import {AppAction, AppActionOptions} from './actions';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';

const initialState: AppStore = {};

export interface AppStore {
    jwt?: string;
    user?: HttpUser;
}

export default function appReducer(state: AppStore = initialState, action: AppAction): AppStore {
    console.log(action,state);
    switch (action.type) {
        case AppActionOptions.SetJWT: {
            return {
                ...state,
                jwt: action.jwt
            };
        }
        case AppActionOptions.Logout: {
            return {
                ...state,
                jwt: null
            };
        }
        case AppActionOptions.SetUser: {
            return {
                ...state,
                user: action.user
            };
        }
    }
    return state;
}
