import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, Router} from 'react-router';
import {Home} from './components/home';
import {Register} from './components/register';
import {Game} from './components/game';
import {BrowserRouter} from 'react-router-dom';

export class Main {
    static run() {
        ReactDOM.render(
            <BrowserRouter>
                <div>
                    <Route exact path="/" component={Home} />
                    <Route path="/register" component={Register} />
                    <Route path="/game" component={Game} />
                </div>
            </BrowserRouter>,
            document.getElementById('main')
        );
    }
}

Main.run();
