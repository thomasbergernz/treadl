import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Router } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import createBrowserHistory from 'history/createBrowserHistory';
import 'react-toastify/dist/ReactToastify.css';
import 'pell/dist/pell.min.css';

import './index.css';
import reducers from './reducers';
import App from './components/App.js';
import DraftExport from 'components/main/projects/objects/DraftExport';
import * as serviceWorker from './registerServiceWorker';

export const store = createStore(reducers);

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

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
