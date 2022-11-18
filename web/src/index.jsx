import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import 'react-toastify/dist/ReactToastify.css';
import 'pell/dist/pell.min.css';

import './index.css';
import reducers from './reducers';
import App from './components/App';

export const store = createStore(reducers);

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
