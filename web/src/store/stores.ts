import {gameStore, GameStoreProps} from './game/store';
import {mainStore, MainStoreProps} from './main/store';
import {uiStore, UIStoreProps} from './ui/store';

export type AppStore = MainStoreProps | GameStoreProps | UIStoreProps;
export const stores: AppStore = {mainStore, gameStore, uiStore};
