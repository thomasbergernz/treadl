import 'react-app-polyfill/ie9';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import 'react-toastify/dist/ReactToastify.css';
import 'pell/dist/pell.min.css';

import reducers from './reducers';

import App from './components/App';
import Home from './components/main/Home';

import PrivacyPolicy from './components/marketing/PrivacyPolicy';
import TermsOfUse from './components//marketing/TermsOfUse';

import Login from './components/Login';
import ForgottenPassword from './components/ForgottenPassword';
import ResetPassword from './components/ResetPassword';

import Settings from './components/main/settings/Settings';
import SettingsIdentity from './components/main/settings/Identity';
import SettingsNotification from './components/main/settings/Notification';
import SettingsAccount from './components/main/settings/Account';

import Profile from './components/main/users/Profile';
import ProfileEdit from './components/main/users/EditProfile';
import ProfileProjects from './components/main/users/ProfileProjects';

import NewProject from './components/main/projects/New';
import Project from './components/main/projects/Project';
import ProjectObjects from './components/main/projects/ProjectObjects';
import ProjectSettings from './components/main/projects/Settings';
import ObjectDraft from './components/main/projects/objects/Draft';
import ObjectList from './components/main/projects/ObjectList';

import NewGroup from './components/main/groups/New';
import Group from './components/main/groups/Group';
import GroupFeed from './components/main/groups/Feed';
import GroupMembers from './components/main/groups/Members';
import GroupProjects from './components/main/groups/Projects';
import GroupSettings from './components/main/groups/Settings';

import Explore from './components/main/explore/Explore'

import Docs from './components/docs';
import DocsHome from './components/docs/Home';
import DocsDoc from './components/docs/Doc';

import Root from './components/main/root';

export const store = createStore(reducers);

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "root", element: <Root /> },
      { path: "explore", element: <Explore /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms-of-use", element: <TermsOfUse /> },
      { path: "password/forgotten", element: <ForgottenPassword /> },
      { path: "password/reset", element: <ResetPassword /> },
      { path: "settings", element: <Settings />, children: [
        { path: "identity", element: <SettingsIdentity /> },
        { path: "notifications", element: <SettingsNotification /> },
        { path: "account", element: <SettingsAccount /> },
        { path: "", element: <SettingsIdentity /> },
      ] },
      { path: "projects/new", element: <NewProject /> },
      { path: "groups/new", element: <NewGroup /> },
      { path: "groups/:id", element: <Group />, children: [
        { path: "feed", element: <GroupFeed /> },
        { path: "members", element: <GroupMembers /> },
        { path: "projects", element: <GroupProjects /> },
        { path: "settings", element: <GroupSettings /> },
        { path: "", element: <GroupFeed /> },
      ] },
      { path: "docs", element: <Docs />, children: [
        { path: ":doc", element: <DocsDoc /> },
        { path: "", element: <DocsHome /> },
      ] },
      { path: ":username/:projectPath", element: <Project />, children: [
        { path: "settings", element: <ProjectSettings /> },
        { path: ":objectId/edit", element: <ObjectDraft /> },
        { path: ":objectId", element: <ProjectObjects /> },
        { path: "", element: <ObjectList /> },
      ] },
      { path: ":username", element: <Profile />, children: [
        { path: "edit", element: <ProfileEdit /> },
        { path: "", element: <ProfileProjects /> },
      ] },
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);