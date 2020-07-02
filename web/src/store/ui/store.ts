import {FactionStats} from '@swg-common/models/factionStats';
import {LadderResponse} from '@swg-common/models/http/userController';
import {action, observable} from 'mobx';
import {DataService} from '../../dataServices';
import {gameStore} from '../game/store';
import {mainStore} from '../main/store';
import {GameState} from '@swg-common/models/gameState';

export type UI = 'None' | 'FactionStats' | 'RoundStats' | 'Ladder' | 'Bases' | 'Votes';

export class UIStore {
  @observable ui: UI = 'None';
  @observable factionStats?: FactionStats[];
  @observable ladder?: LadderResponse;

  @action private setUI(ui: UI) {
    this.ui = ui;
  }
  @action setFactionStats(factionStats: FactionStats[]) {
    this.factionStats = factionStats;
  }
  @action setLadder(ladder: LadderResponse) {
    this.ladder = ladder;
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
    }
    uiStore.setUI(ui);

    switch (ui) {
      case 'FactionStats':
        uiStore.setFactionStats(await DataService.getFactionStats(generation));
        break;
      case 'Ladder':
        uiStore.setLadder(await DataService.getLadder());
        break;
    }
  }
}

export const uiStore = new UIStore();
export type UIStoreProps = {uiStore?: UIStore};
export const UIStoreName = 'uiStore';
