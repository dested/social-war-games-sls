import {SwgStore} from '../reducers';
import {FactionStats} from '@swg-common/models/factionStats';

export enum UIActionOptions {
    ShowGenerationDetails = 'ShowGenerationDetails',
    ShowFactionDetails = 'ShowFactionDetails',
    SetFactionStats = 'SetFactionStats',
    SetGenerationStats = 'SetGenerationStats'
}

export interface ShowGenerationDetailsAction {
    type: UIActionOptions.ShowGenerationDetails;
    showGenerationDetails: boolean;
}
export interface ShowFactionDetailsAction {
    type: UIActionOptions.ShowFactionDetails;
    showFactionDetails: boolean;
}

export interface SetFactionStatsAction {
    type: UIActionOptions.SetFactionStats;
    factionStats: FactionStats;
}
export interface SetGenerationStatsAction {
    type: UIActionOptions.SetGenerationStats;
    generationStats: any;
}

export type UIAction =
    | ShowGenerationDetailsAction
    | ShowFactionDetailsAction
    | SetFactionStatsAction
    | SetGenerationStatsAction;

export class UIActions {
    static showGenerationDetails(showGenerationDetails: boolean): ShowGenerationDetailsAction {
        return {
            type: UIActionOptions.ShowGenerationDetails,
            showGenerationDetails
        };
    }
    static showFactionDetails(showFactionDetails: boolean): ShowFactionDetailsAction {
        return {
            type: UIActionOptions.ShowFactionDetails,
            showFactionDetails
        };
    }
    static setGenerationStats(generationStats: any): SetGenerationStatsAction {
        return {
            type: UIActionOptions.SetGenerationStats,
            generationStats
        };
    }

    static setFactionStats(factionStats: FactionStats): SetFactionStatsAction {
        return {
            type: UIActionOptions.SetFactionStats,
            factionStats
        };
    }
}
