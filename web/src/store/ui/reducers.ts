import {UIAction, UIActionOptions} from './actions';
import {FactionStats} from '@swg-common/models/factionStats';

const initialState: UIStore = {
    showGenerationDetails: false,
    showFactionDetails: false
};

export interface UIStore {
    showGenerationDetails: boolean;
    showFactionDetails: boolean;
    factionStats?: FactionStats;
    generationStats?: any;
}

export default function gameReducer(state: UIStore = initialState, action: UIAction): UIStore {
    switch (action.type) {
        case UIActionOptions.ShowGenerationDetails: {
            return {
                ...state,
                showGenerationDetails: action.showGenerationDetails
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
        case UIActionOptions.SetGenerationStats: {
            return {
                ...state,
                generationStats: action.generationStats
            };
        }
    }
    return state;
}
