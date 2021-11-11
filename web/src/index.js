import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Router } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import 'react-toastify/dist/ReactToastify.css';
import 'pell/dist/pell.min.css';

import './index.css';
import reducers from './reducers';
import App from './components/App.js';
import DraftExport from 'components/main/projects/objects/DraftExport';
import * as serviceWorker from './registerServiceWorker';

export const store = createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
    <Router history={createBrowserHistory()}>
      <Switch>
        <Route path="/objects/:id/export" component={DraftExport} />
        <Route component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
serviceWorker.unregister();
