import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Divider } from 'semantic-ui-react';
import styled, { createGlobalStyle } from 'styled-components';

import api from '../api';
import actions from '../actions';
import utils from '../utils/utils.js';
import NavBar from './includes/NavBar';
import Footer from './includes/Footer';

import MarketingHome from './marketing/Home';
import PrivacyPolicy from './marketing/PrivacyPolicy';
import TermsOfUse from './marketing/TermsOfUse';

import Login from './Login';
import ForgottenPassword from './ForgottenPassword';
import ResetPassword from './ResetPassword';

import Home from './main/Home';

import Profile from './main/users/Profile';
import ProfileEdit from './main/users/EditProfile';
import ProfileProjects from './main/users/ProfileProjects';

import NewProject from './main/projects/New';
import Project from './main/projects/Project';
import ProjectObjects from './main/projects/ProjectObjects';
import ProjectSettings from './main/projects/Settings';
import ObjectDraft from './main/projects/objects/Draft';
import ObjectList from './main/projects/ObjectList';

import Settings from './main/settings/Settings';
import SettingsIdentity from './main/settings/Identity';
import SettingsNotification from './main/settings/Notification';
import SettingsAccount from './main/settings/Account';

import NewGroup from './main/groups/New';
import Group from './main/groups/Group';
import GroupFeed from './main/groups/Feed';
import GroupMembers from './main/groups/Members';
import GroupProjects from './main/groups/Projects';
import GroupSettings from './main/groups/Settings';

import Explore from './main/explore/Explore'

import Docs from './docs';
import DocsHome from './docs/Home';
import DocsDoc from './docs/Doc';

import Root from './main/root';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: rgb(255, 251, 248);
  }
`;

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthenticating, isAuthenticatingType, user, driftReady, syncedToDrift } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const { isAuthenticated, isAuthenticating, isAuthenticatingType } = state.auth;
    const { driftReady, syncedToDrift } = state.users;
    return { isAuthenticated, isAuthenticating, isAuthenticatingType, user, driftReady, syncedToDrift };
  });
  const loggedInUserId = user?._id;

  useEffect(() => {
    api.auth.autoLogin(token => dispatch(actions.auth.receiveLogin(token)));
  }, [dispatch]);

  useEffect(() => {
    if (!loggedInUserId) return;
    api.users.getMyProjects(p => dispatch(actions.projects.receiveProjects(p)));
    api.groups.getMine(g => dispatch(actions.groups.receiveGroups(g)));
    api.invitations.get(({ invitations, sentInvitations}) => {
      dispatch(actions.invitations.receiveInvitations(invitations.concat(sentInvitations)));
    });
  }, [dispatch, loggedInUserId]);

  useEffect(() => {
    window.drift && window.drift.on('ready', () => {
      dispatch(actions.users.initDrift());
    });
  }, [dispatch]);

  useEffect(() => {
    if (user && driftReady && !syncedToDrift && window.drift) {
      window.drift.identify(user._id, {
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      });
      dispatch(actions.users.syncDrift(null));
    }
  }, [dispatch, user, driftReady, syncedToDrift]);

  return (
    <StyledContent>
      <GlobalStyle whiteColor />
      <Helmet defaultTitle={utils.appName()} titleTemplate={`%s | ${utils.appName()}`} />
      <NavBar />
      <div style={{ flex: '1' }}>
        <Routes>
          <Route end path="/" element={isAuthenticated
            ? <Home />
            : <MarketingHome onRegisterClicked={() => dispatch(actions.auth.openRegister())} />
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/password/forgotten" element={<ForgottenPassword />} />
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/settings" element={<Settings />}>
            <Route path='identity' element={<SettingsIdentity />} />
            <Route path='notifications' element={<SettingsNotification />} />
            <Route path='account' element={<SettingsAccount />} />
            <Route path='' element={<SettingsIdentity />} />
          </Route>
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/groups/new" element={<NewGroup />} />
          <Route path="/groups/:id" element={<Group />}>
            <Route path='feed' element={<GroupFeed />} />
            <Route path='members' element={<GroupMembers />} />
            <Route path='projects' element={<GroupProjects />} />
            <Route path='settings' element={<GroupSettings />} />
            <Route path='' end element={<GroupFeed />} />
          </Route>
          <Route path='/root' element={<Root />} />
          <Route path='/docs' element={<Docs />}>
            <Route path=":doc" element={<DocsDoc />} />
            <Route path='' element={<DocsHome />} />
          </Route>
          <Route path='/:username/:projectPath' element={<Project />}>
            <Route path="settings" element={<ProjectSettings />} />
            <Route path=":objectId/edit" element={<ObjectDraft />} />
            <Route path=":objectId" element={<ProjectObjects />} />
            <Route path='' element={<ObjectList />} />
          </Route>
          <Route path='/explore' element={<Explore />} />
          <Route path="/:username" element={<Profile />}>
            <Route path="edit" element={<ProfileEdit />} />
            <Route path='' element={<ProfileProjects />} />
          </Route>
        </Routes>
        <Login open={isAuthenticating} authType={isAuthenticatingType} onClose={() => dispatch(actions.auth.closeAuthentication())} />
        <ToastContainer position={toast.POSITION.BOTTOM_CENTER} hideProgressBar/>
        <Divider hidden section />
      </div>
      <Footer />
    </StyledContent>
  );
}

export default App;
