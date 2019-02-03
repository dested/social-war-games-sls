import {FactionStats} from '@swg-common/models/factionStats';
import {LadderResponse} from '@swg-common/models/http/userController';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import {DataService} from '../../dataServices';
import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';

export type UI = 'None' | 'FactionStats' | 'RoundStats' | 'Ladder' | 'Bases' | 'Votes';
export enum UIActionOptions {
  SetUI = 'SetUI',
  SetLadder = 'SetLadder',
  SetFactionStats = 'SetFactionStats',
  SetFactionRoundStats = 'SetFactionRoundStats',
}

export interface SetUIAction {
  type: UIActionOptions.SetUI;
  ui: UI;
}
export interface SetLadderAction {
  type: UIActionOptions.SetLadder;
  ladder: LadderResponse;
}

export interface SetFactionStatsAction {
  type: UIActionOptions.SetFactionStats;
  factionStats: FactionStats[];
}

export interface SetFactionRoundStatsAction {
  type: UIActionOptions.SetFactionRoundStats;
  factionRoundStats: FactionRoundStats;
}

export type UIAction = SetUIAction | SetLadderAction | SetFactionStatsAction | SetFactionRoundStatsAction;

export class UIActions {
  static setUI(ui: UI): SetUIAction {
    return {
      type: UIActionOptions.SetUI,
      ui,
    };
  }

  static setLadder(ladder: LadderResponse): SetLadderAction {
    return {
      type: UIActionOptions.SetLadder,
      ladder,
    };
  }
  static setFactionStats(factionStats: FactionStats[]): SetFactionStatsAction {
    return {
      type: UIActionOptions.SetFactionStats,
      factionStats,
    };
  }
  static setFactionRoundStats(factionRoundStats: FactionRoundStats): SetFactionRoundStatsAction {
    return {
      type: UIActionOptions.SetFactionRoundStats,
      factionRoundStats,
    };
  }
}

export class UIThunks {
  static setUI(ui: UI) {
    return async (dispatch: Dispatcher, getState: () => SwgStore) => {
      const {factionId} = getState().appState.user;
      const {generation} = getState().gameState.game;

      switch (ui) {
        case 'FactionStats':
          dispatch(UIActions.setFactionStats(null));
          break;
        case 'Ladder':
          dispatch(UIActions.setLadder(null));
          break;
        case 'RoundStats':
          dispatch(UIActions.setFactionRoundStats(null));
          break;
      }
      dispatch(UIActions.setUI(ui));

      switch (ui) {
        case 'FactionStats':
          dispatch(UIActions.setFactionStats(await DataService.getFactionStats(generation)));
          break;
        case 'Ladder':
          dispatch(UIActions.setLadder(await DataService.getLadder()));
          break;
        case 'RoundStats':
          dispatch(UIActions.setFactionRoundStats(await DataService.getFactionRoundStats(generation - 1, factionId)));
          break;
      }
    };
  }

  static getFactionRoundStats(generation: number) {
    return async (dispatch: Dispatcher, getState: () => SwgStore) => {
      const {factionId} = getState().appState.user;

      dispatch(UIActions.setFactionRoundStats(null));
      try {
        dispatch(UIActions.setFactionRoundStats(await DataService.getFactionRoundStats(generation, factionId)));
      } catch (ex) {
        dispatch(UIActions.setFactionRoundStats(null));
      }
    };
  }
}
