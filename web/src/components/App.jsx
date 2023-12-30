import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
import Login from './Login';

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
  const { isAuthenticated, isAuthenticating, isAuthenticatingType, user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const { isAuthenticated, isAuthenticating, isAuthenticatingType } = state.auth;
    return { isAuthenticated, isAuthenticating, isAuthenticatingType, user };
  });
  const loggedInUserId = user?._id;

  useEffect(() => {
    api.auth.autoLogin(token => dispatch(actions.auth.receiveLogin(token)));
  }, [dispatch]);
  
  useEffect(() => {
    api.search.explore(1, data => { // Page is always 1 on app-load
      dispatch(actions.objects.receiveExplore(data.objects));
    });
  }, []);

  useEffect(() => {
    if (!loggedInUserId) return;
    api.users.getMyProjects(p => dispatch(actions.projects.receiveProjects(p)));
    api.groups.getMine(g => dispatch(actions.groups.receiveGroups(g)));
    api.invitations.get(({ invitations, sentInvitations}) => {
      dispatch(actions.invitations.receiveInvitations(invitations.concat(sentInvitations)));
    });
  }, [dispatch, loggedInUserId]);

  return (
    <StyledContent>
      <GlobalStyle whiteColor />
      <Helmet defaultTitle={utils.appName()} titleTemplate={`%s | ${utils.appName()}`} />
      <NavBar />
      <div style={{ flex: '1' }}>
        <Outlet />
      </div>
      <Login open={isAuthenticating} authType={isAuthenticatingType} onClose={() => dispatch(actions.auth.closeAuthentication())} />
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} hideProgressBar/>
      <Divider hidden section />
      <Footer />
    </StyledContent>
  );
}

export default App;
