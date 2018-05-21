import reducers from './reducers';
import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

const composeEnhancers =
    typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const enhancer = composeEnhancers(
    applyMiddleware(thunk)
    // other store enhancers if any
);

const store = createStore(reducers, enhancer);

const getState = () => store.getState();

export {store, getState};
