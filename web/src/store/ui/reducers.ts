import {UI, UIAction, UIActionOptions} from './actions';
import {FactionStats} from '@swg-common/models/factionStats';
import {LadderResponse} from '@swg-common/models/http/userController';
import {FactionRoundStats} from '@swg-common/models/roundStats';

const initialState: UIStore = {
    ui: 'None'
};

export interface UIStore {
    ui: UI;
    factionStats?: FactionStats[];
    ladder?: LadderResponse;
    factionRoundStats?: FactionRoundStats;
}

export default function uiReducer(state: UIStore = initialState, action: UIAction): UIStore {
    switch (action.type) {
        case UIActionOptions.SetUI: {
            return {
                ...state,
                ui: action.ui
            };
        }
        case UIActionOptions.SetFactionStats: {
            return {
                ...state,
                factionStats: action.factionStats
            };
        }
        case UIActionOptions.SetLadder: {
            return {
                ...state,
                ladder: action.ladder
            };
        }
        case UIActionOptions.SetFactionRoundStats: {
            return {
                ...state,
                factionRoundStats: action.factionRoundStats
            };
        }
    }
    return state;
}
