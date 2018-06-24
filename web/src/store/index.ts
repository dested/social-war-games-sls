import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';
import {AppActions} from './app/actions';
import reducers from './reducers';

const composeEnhancers =
    typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const enhancer = composeEnhancers(
    applyMiddleware(thunk)
    // other store enhancers if any
);

const store = createStore(reducers, enhancer);

const jwt = localStorage.getItem('jwt');
const user = localStorage.getItem('user');
if (jwt && user) {
    store.dispatch(AppActions.setJWT(jwt));
    store.dispatch(AppActions.setUser(JSON.parse(user)));
}

const getStore = () => store;

export {store, getStore};
