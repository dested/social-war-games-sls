import * as React from 'react';
import {Fragment} from 'react';
import * as ReactDOM from 'react-dom';
import {Route} from 'react-router';
import {Provider} from 'react-redux';

import {Register} from './components/register';
import {Game} from './components/game';
import {HashRouter} from 'react-router-dom';
import {Login} from './components/login';
import {store} from './store';

export class Main {
    static run() {
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
}

Main.run();
