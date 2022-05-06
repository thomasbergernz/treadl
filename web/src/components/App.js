import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Grid, Divider, Icon, Container } from 'semantic-ui-react';

import api from 'api';
import actions from 'actions';
import NavBar from 'components/includes/NavBar';
import logo from 'images/logo/main.png';

import MarketingHome from './marketing/Home.js';
import PrivacyPolicy from './marketing/PrivacyPolicy';
import TermsOfUse from './marketing/TermsOfUse';

import Login from './Login.js';
import ForgottenPassword from './ForgottenPassword';
import ResetPassword from './ResetPassword';

import Home from './main/Home.js';

import Profile from './main/users/Profile.js';
import ProfileEdit from './main/users/EditProfile';
import ProfileProjects from './main/users/ProfileProjects';

import NewProject from './main/projects/New.js';
import Project from './main/projects/Project.js';
import ProjectObjects from './main/projects/ProjectObjects.js';
import ProjectSettings from './main/projects/Settings.js';
import ObjectDraft from './main/projects/objects/Draft.js';
import ObjectList from './main/projects/ObjectList.js';

import Settings from './main/settings/Settings.js';
import SettingsIdentity from './main/settings/Identity';
import SettingsNotification from './main/settings/Notification';
import SettingsAccount from './main/settings/Account';

import NewGroup from './main/groups/New.js';
import Group from './main/groups/Group.js';
import GroupFeed from './main/groups/Feed.js';
import GroupMembers from './main/groups/Members.js';
import GroupProjects from './main/groups/Projects.js';
import GroupSettings from './main/groups/Settings.js';

import Root from './main/root';
//import Docs from './docs';

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
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Helmet defaultTitle={'Treadl'} titleTemplate={`%s | Treadl`} />
      <NavBar />
      <div style={{ flex: '1 0 0' }}>
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
          <Route path='/:username/:projectPath' element={<Project />}>
            <Route path="settings" element={<ProjectSettings />} />
            <Route path=":objectId/edit" element={<ObjectDraft />} />
            <Route path=":objectId" element={<ProjectObjects />} />
            <Route path='' element={<ObjectList />} />
          </Route>
          <Route path="/:username" element={<Profile />}>
            <Route path="edit" element={<ProfileEdit />} />
            <Route path='' element={<ProfileProjects />} />
          </Route>
        </Routes>
        <Login open={isAuthenticating} authType={isAuthenticatingType} onClose={() => dispatch(actions.auth.closeAuthentication())} />
        <ToastContainer position={toast.POSITION.BOTTOM_CENTER} hideProgressBar/>
        <Divider hidden section />
      </div>

      <div style={{ background: 'rgb(240,240,240)', padding: '30px 0px' }}>
        <Container>
          <Grid>
            <Grid.Column computer={8}>
              <Link to="/"><img alt="Treadl logo" src={logo} style={{ width: '100px', paddingTop: 20, paddingBottom: 20 }} /></Link>
              <p style={{marginTop: 10}}><small>Treadl software is free and open-source. Contributions to the project are always welcome.
                <br />
                <Icon name="code" /> <a href={process.env.REACT_APP_SOURCE_REPO_URL} target="_blank" rel="noopener noreferrer">Project source homepage</a>
              </small></p>
            </Grid.Column>
            <Grid.Column computer={8} textAlign="right">
              <div style={{ paddingTop: 40 }}>
                <p>
                  <Icon name='trophy' />
                  <a href='https://www.patreon.com/treadl' target='_blank' rel='noopener noreferrer'>Become a patron</a>
                </p>
                <p>
                  <Icon name='book' />
                  <a href={process.env.REACT_APP_SUPPORT_ROOT} target='_blank' rel='noopener noreferrer'>Documentation</a>
                </p>

                <Divider />
                <p>
                  <Icon name="file alternate outline" />
                  <Link to="/privacy">Privacy Policy</Link>
                </p>
                <p>
                  <Icon name="file alternate outline" />
                  <Link to="terms-of-use">Terms of Use</Link>
                </p>
              </div>
            </Grid.Column>
          </Grid>
        </Container>
      </div>

    </div>
  );
}

export default App;
