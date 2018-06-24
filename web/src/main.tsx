import * as React from 'react';
import {Fragment} from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Route} from 'react-router';

import {HashRouter} from 'react-router-dom';
import {Game} from './components/game';
import {Login} from './components/login';
import {Register} from './components/register';
import {store} from './store';

function run() {
    ReactDOM.render(
        <Provider store={store}>
            <HashRouter>
                <Fragment>
                    <Route exact path="/" component={Game} />
                    <Route path="/register" component={Register} />
                    <Route path="/login" component={Login} />
                </Fragment>
            </HashRouter>
        </Provider>,
        document.getElementById('main')
    );
}

run();
