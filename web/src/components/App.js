import React, { useEffect } from 'react';
import { Routes, Route, Link, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Grid, Divider, Icon, Container } from 'semantic-ui-react';

import api from 'api';
import actions from 'actions';
import utils from 'utils/utils.js';
import NavBar from 'components/includes/NavBar';

import logo from 'images/logo/main.png';
import MarketingHome from './marketing/Home.js';
import MarketingPricing from './marketing/Pricing.js';
import PrivacyPolicy from './marketing/PrivacyPolicy';
import TermsOfUse from './marketing/TermsOfUse';
import Login from './Login.js';
import ForgottenPassword from './ForgottenPassword';
import ResetPassword from './ResetPassword';
import Home from './main/Home.js';
import Profile from './main/users/Profile.js';
import NewProject from './main/projects/New.js';
import Project from './main/projects/Project.js';
import Settings from './main/settings/Settings.js';
import NewGroup from './main/groups/New.js';
import Group from './main/groups/Group.js';
import Root from './main/root';
//import Docs from './docs';

function App({ user, groups, syncedToDrift, driftReady, onOpenRegister, onCloseAuthentication, isAuthenticating, isAuthenticatingType, isAuthenticated, onLoginSuccess, onLogout, onReceiveProjects, onReceiveInvitations, onReceiveGroups, onDriftReady, onDriftSynced, helpModalOpen, openHelpModal, searchTerm, updateSearchTerm, searchPopupOpen, openSearchPopup, searchResults, updateSearchResults, searching, updateSearching, history }) {
  const loggedInUserId = user?._id;

  useEffect(() => {
    api.auth.autoLogin(onLoginSuccess);
  }, [onLoginSuccess]);

  useEffect(() => {
    if (!loggedInUserId) return;
    api.users.getMyProjects(onReceiveProjects);
    api.groups.getMine(onReceiveGroups);
    api.invitations.get(({ invitations, sentInvitations}) => {
      onReceiveInvitations(invitations.concat(sentInvitations));
    });
  }, [loggedInUserId, onReceiveProjects, onReceiveGroups, onReceiveInvitations]);

  useEffect(() => {
    window.drift && window.drift.on('ready', () => {
      onDriftReady();
    });
  }, [onDriftReady]);

  useEffect(() => {
    if (user && driftReady && !syncedToDrift && window.drift) {
      window.drift.identify(user._id, {
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      });
      onDriftSynced();
    }
  }, [user, driftReady, syncedToDrift, onDriftSynced]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Helmet defaultTitle={'Treadl'} titleTemplate={`%s | Treadl`} />
      <NavBar />
      <div style={{ flex: '1 0 0' }}>
        <Routes>
          <Route exact path="/" element={isAuthenticated
            ? <Home />
            : <MarketingHome onRegisterClicked={onOpenRegister} />
          } />
          <Route path="/pricing" element={<MarketingPricing onRegisterClicked={onOpenRegister} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/password/forgotten" element={<ForgottenPassword />} />
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/groups/new" element={<NewGroup />} />
          <Route path="/groups/:id" element={<Group />} />
          <Route path='/root' element={<Root />} />
          <Route path="/:username/edit" element={<Profile />} />
          <Route path="/:username/:projectPath" element={<Project />} />
          <Route path="/:username" element={<Profile />} />
        </Routes>
        <Login open={isAuthenticating} authType={isAuthenticatingType} onClose={onCloseAuthentication} />
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

const mapStateToProps = (state) => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
  const { isAuthenticated, isAuthenticating, isAuthenticatingType } = state.auth;
  const { driftReady, syncedToDrift } = state.users;
  const { helpModalOpen, searchPopupOpen, searchTerm, searchResults, searching } = state.app;
  return { isAuthenticated, isAuthenticating, isAuthenticatingType, user, groups, driftReady, syncedToDrift, helpModalOpen, searchPopupOpen, searchTerm, searchResults, searching };
};
const mapDispatchToProps = dispatch => ({
  onOpenRegister: () => dispatch(actions.auth.openRegister()),
  onCloseAuthentication: () => dispatch(actions.auth.closeAuthentication()),
  onLoginSuccess: token => dispatch(actions.auth.receiveLogin(token)),
  onLogout: () => dispatch(actions.auth.logout()),
  onReceiveProjects: p => dispatch(actions.projects.receiveProjects(p)),
  onReceiveGroups: g => dispatch(actions.groups.receiveGroups(g)),
  onReceiveInvitations: i => dispatch(actions.invitations.receiveInvitations(i)),
  onDriftSynced: (s) => dispatch(actions.users.syncDrift(s)),
  onDriftReady: () => dispatch(actions.users.initDrift()),
  openHelpModal: o => dispatch(actions.app.openHelpModal(o)),
  openSearchPopup: o => dispatch(actions.app.openSearchPopup(o)),
  updateSearchTerm: t => dispatch(actions.app.updateSearchTerm(t)),
  updateSearchResults: r => dispatch(actions.app.updateSearchResults(r)),
  updateSearching: s => dispatch(actions.app.updateSearching(s)),
});

const AppContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(App));

export default AppContainer;
