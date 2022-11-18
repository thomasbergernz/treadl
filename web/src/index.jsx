import 'react-app-polyfill/ie9';
import React from 'react';
import { createRoot } from 'react-dom/client';
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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);