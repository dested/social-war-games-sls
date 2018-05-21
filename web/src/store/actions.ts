import {Dispatch} from 'redux';
import {GameAction} from './game/actions';
import {AppAction} from './app/actions';

export * from './app/actions';
export * from './game/actions';

export type Dispatcher = Dispatch<AppAction | GameAction,{}>;
