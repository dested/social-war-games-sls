import {UIAction, UIActionOptions} from './actions';
import {FactionStats} from '@swg-common/models/factionStats';
import {FactionRoundStats} from '@swg-common/models/roundStats';

const initialState: UIStore = {
    showFactionRoundStats: false,
    showFactionDetails: false
};

export interface UIStore {
    showFactionRoundStats: boolean;
    showFactionDetails: boolean;
    factionStats?: FactionStats;
    factionRoundStats?: FactionRoundStats;
}

export default function gameReducer(state: UIStore = initialState, action: UIAction): UIStore {
    switch (action.type) {
        case UIActionOptions.ShowFactionRoundStats: {
            return {
                ...state,
                showFactionRoundStats: action.showFactionRoundStats
            };
        }
        case UIActionOptions.ShowFactionDetails: {
            return {
                ...state,
                showFactionDetails: action.showFactionDetails
            };
        }
        case UIActionOptions.SetFactionStats: {
            return {
                ...state,
                factionStats: action.factionStats
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
