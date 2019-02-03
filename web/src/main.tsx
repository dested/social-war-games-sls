///<reference path="../../common/src/types/aesjs.d.ts"/>

import {configure} from 'mobx';
import {Provider} from 'mobx-react';
import * as React from 'react';
import {Fragment} from 'react';
import * as ReactDOM from 'react-dom';
import {Route} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {Game} from './components/game';
import {Login} from './components/login';
import {Register} from './components/register';
import {stores} from './store/stores';

configure({enforceActions: 'always'});

function run() {
  ReactDOM.render(
    <Provider {...stores}>
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
