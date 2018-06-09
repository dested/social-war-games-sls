import {combineReducers} from 'redux';
import {AppStore, default as appReducer} from './app/reducers';
import {GameStore, default as gameReducer} from './game/reducers';
import {UIStore, default as uiReducer} from './ui/reducers';


export interface SwgStore {
    appState: AppStore;
    gameState: GameStore;
    uiState: UIStore;
}

export default combineReducers<SwgStore>({
    appState: appReducer,
    gameState: gameReducer,
    uiState: uiReducer
});

