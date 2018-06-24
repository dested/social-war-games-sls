import {Dispatch} from 'redux';
import {AppAction} from './app/actions';
import {GameAction} from './game/actions';
import {UIAction} from './ui/actions';

export * from './app/actions';
export * from './game/actions';
export * from './ui/actions';

export type Dispatcher = Dispatch<AppAction | GameAction | UIAction, {}>;
