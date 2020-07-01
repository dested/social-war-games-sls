import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {stores} from './store/stores';
import {HashRouter} from 'react-router-dom';
import {Route} from 'react-router';
import {Game} from './components/game';
import {Register} from './components/register';
import {Games} from './components/games';
import {Login} from './components/login';
import {Provider} from 'mobx-react';
import {configure} from 'mobx';

configure({enforceActions: 'always'});

ReactDOM.render(
  // <React.StrictMode>
  <Provider {...stores}>
    <HashRouter>
      <Fragment>
        <Route exact path="/" component={Game} />
        <Route path="/register" component={Register} />
        <Route path="/games" component={Games} />
        <Route path="/login" component={Login} />
      </Fragment>
    </HashRouter>
  </Provider>,
  // </React.StrictMode>
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
