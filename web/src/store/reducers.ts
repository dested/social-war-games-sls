import {combineReducers} from 'redux';
import {AppStore, default as appReducer} from './app/reducers';

export interface SwgStore {
    appState: AppStore;
}

export default combineReducers<SwgStore>({
    appState: appReducer as any
});
