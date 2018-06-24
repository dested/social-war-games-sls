import {HttpUser} from '@swg-common/models/http/httpUser';
import {AppAction, AppActionOptions} from './actions';

const initialState: AppStore = {};

export interface AppStore {
    jwt?: string;
    user?: HttpUser;
}

export default function appReducer(state: AppStore = initialState, action: AppAction): AppStore {
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
