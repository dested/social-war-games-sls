import {combineReducers} from 'redux';
import {AppStore, default as appReducer} from './app/reducers';
import {GameStore, default as gameReducer} from './game/reducers';


export interface SwgStore {
    appState: AppStore;
    gameState: GameStore;
}

export default combineReducers<SwgStore>({
    appState: appReducer,
    gameState: gameReducer
});

