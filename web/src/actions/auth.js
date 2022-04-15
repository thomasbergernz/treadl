import api from 'api';
import actions from 'actions';
import { store } from 'index.js';

export default {

  OPEN_LOGIN: 'OPEN_LOGIN',
  OPEN_REGISTER: 'OPEN_REGISTER',
  CLOSE_AUTHENTICATION: 'CLOSE_AUTHENTICATION',
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  UPDATE_PLAN: 'UPDATE_PLAN',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',

  openLogin() {
    return { type: this.OPEN_LOGIN };
  },
  openRegister() {
    return { type: this.OPEN_REGISTER };
  },
  closeAuthentication() {
    return { type: this.CLOSE_AUTHENTICATION };
  },

  requestLogin() {
    return { type: this.LOGIN_REQUEST };
  },

  receiveLogin(token) {
    api.token = token;
    api.users.me(user => store.dispatch(actions.users.receive(user)));
    return { type: this.LOGIN_SUCCESS, token };
  },

  loginError(error) {
    return { type: this.LOGIN_FAILURE, error };
  },

  updatePlan(planId) {
    return { type: this.UPDATE_PLAN, planId };
  },

  logout() {
    return { type: this.LOGOUT_SUCCESS };
  },
};
