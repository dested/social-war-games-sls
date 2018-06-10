import {SwgStore} from '../reducers';
import {FactionStats} from '@swg-common/models/factionStats';
import {FactionRoundStats} from '@swg-common/models/roundStats';

export enum UIActionOptions {
    ShowFactionRoundStats = 'ShowFactionRoundStats',
    ShowFactionDetails = 'ShowFactionDetails',
    SetFactionStats = 'SetFactionStats',
    SetFactionRoundStats = 'SetFactionRoundStats'
}

export interface ShowFactionRoundStatsAction {
    type: UIActionOptions.ShowFactionRoundStats;
    showFactionRoundStats: boolean;
}
export interface ShowFactionDetailsAction {
    type: UIActionOptions.ShowFactionDetails;
    showFactionDetails: boolean;
}

export interface SetFactionStatsAction {
    type: UIActionOptions.SetFactionStats;
    factionStats: FactionStats;
}
export interface SetFactionRoundStatsAction {
    type: UIActionOptions.SetFactionRoundStats;
    factionRoundStats: FactionRoundStats;
}

export type UIAction =
    | ShowFactionRoundStatsAction
    | ShowFactionDetailsAction
    | SetFactionStatsAction
    | SetFactionRoundStatsAction;

export class UIActions {
    static showFactionRoundStats(showFactionRoundStats: boolean): ShowFactionRoundStatsAction {
        return {
            type: UIActionOptions.ShowFactionRoundStats,
            showFactionRoundStats
        };
    }
    static showFactionDetails(showFactionDetails: boolean): ShowFactionDetailsAction {
        return {
            type: UIActionOptions.ShowFactionDetails,
            showFactionDetails
        };
    }
    static setFactionRoundStats(factionRoundStats: FactionRoundStats): SetFactionRoundStatsAction {
        return {
            type: UIActionOptions.SetFactionRoundStats,
            factionRoundStats
        };
    }

    static setFactionStats(factionStats: FactionStats): SetFactionStatsAction {
        return {
            type: UIActionOptions.SetFactionStats,
            factionStats
        };
    }
}
