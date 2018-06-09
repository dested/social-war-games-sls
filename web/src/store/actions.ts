import {Dispatch} from 'redux';
import {GameAction} from './game/actions';
import {AppAction} from './app/actions';
import {UIAction} from './ui/actions';

export * from './app/actions';
export * from './game/actions';
export * from './ui/actions';

export type Dispatcher = Dispatch<AppAction | GameAction | UIAction, {}>;
