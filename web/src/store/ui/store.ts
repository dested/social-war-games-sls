import {ActionRoute} from '@swg-common/game/entityDetail';
import {GameLogic} from '@swg-common/game/gameLogic';
import {FactionStats} from '@swg-common/models/factionStats';
import {LadderResponse} from '@swg-common/models/http/userController';
import {action, observable} from 'mobx';
import {DataService} from '../../dataServices';
import {gameStore} from '../game/store';
import {mainStore} from '../main/store';

export type UI = 'None' | 'FactionStats' | 'RoundStats' | 'Ladder' | 'Bases' | 'Votes';

export class UIStore {
  @observable ui: UI = 'None';
  @observable factionStats?: FactionStats[];
  @observable ladder?: LadderResponse;
  @observable factionRoundStats?: any;

  @action private setUI(ui: UI) {
    this.ui = ui;
  }
  @action setFactionStats(factionStats: FactionStats[]) {
    this.factionStats = factionStats;
  }
  @action setLadder(ladder: LadderResponse) {
    this.ladder = ladder;
  }
  @action setFactionRoundStats(factionRoundStats: any) {
    this.factionRoundStats = factionRoundStats;
    gameStore.setLastRoundActionsFromNotes(factionRoundStats, null, gameStore.game, gameStore.game);
  }

  static async setUI(ui: UI) {
    const {factionId} = mainStore.user;
    const {generation} = gameStore.game;

    switch (ui) {
      case 'FactionStats':
        uiStore.setFactionStats(null);
        break;
      case 'Ladder':
        uiStore.setLadder(null);
        break;
      case 'RoundStats':
        uiStore.setFactionRoundStats(null);
        break;
    }
    uiStore.setUI(ui);

    switch (ui) {
      case 'FactionStats':
        uiStore.setFactionStats(await DataService.getFactionStats(generation));
        break;
      case 'Ladder':
        uiStore.setLadder(await DataService.getLadder());
        break;
      case 'RoundStats':
        // uiStore.setFactionRoundStats(await DataService.getFactionRoundStats(generation - 1, factionId));
        break;
    }
  }

  static async getFactionRoundStats(generation: number) {
    const {factionId} = mainStore.user;

    uiStore.setFactionRoundStats(null);
    try {
      // uiStore.setFactionRoundStats(await DataService.getFactionRoundStats(generation, factionId));
    } catch (ex) {
      uiStore.setFactionRoundStats(null);
    }
  }
}

export const uiStore = new UIStore();
export type UIStoreProps = {uiStore?: UIStore};
export const UIStoreName = 'uiStore';
