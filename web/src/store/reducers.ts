import {combineReducers} from 'redux';
import {AppStore, default as appReducer} from './app/reducers';
import {default as gameReducer, GameStore} from './game/reducers';
import {default as uiReducer, UIStore} from './ui/reducers';

export interface SwgStore {
  appState: AppStore;
  gameState: GameStore;
  uiState: UIStore;
}

export default combineReducers<SwgStore>({
  appState: appReducer,
  gameState: gameReducer,
  uiState: uiReducer,
});
