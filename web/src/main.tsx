import * as React from 'react';
import {Fragment} from 'react';
import * as ReactDOM from 'react-dom';
import {Route} from 'react-router';
import {Home} from './components/home';
import {Register} from './components/register';
import {Game} from './components/game';
import {BrowserRouter} from 'react-router-dom';

import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import reducers from './store/reducers';

const composeEnhancers =
    typeof window === 'object' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        }) : compose;

const enhancer = composeEnhancers(
    applyMiddleware(),
    // other store enhancers if any
);


const store = createStore(reducers, enhancer);

export class Main {
    static run() {
        ReactDOM.render(
            <Provider store={store}>
                <BrowserRouter>
                    <Fragment>
                        <Route exact path="/" component={Home} />
                        <Route path="/register" component={Register} />
                        <Route path="/game" component={Game} />
                    </Fragment>
                </BrowserRouter>
            </Provider>,
            document.getElementById('main')
        );
    }
}

Main.run();
