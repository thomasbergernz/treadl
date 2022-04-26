import api from 'api';
import actions from 'actions';
import { store } from 'index.js';

export const users = {
  me(success, fail) {
    api.authenticatedRequest('GET', '/users/me', null, success, fail);
  },
  get(username, success, fail) {
    api.authenticatedRequest('GET', `/users/${username}`, null, success, fail);
  },
  update(username, data, success, fail) {
    api.authenticatedRequest('PUT', `/users/${username}`, data, success, fail);
  },
  finishTour(username, tour, status, success, fail) {
    api.authenticatedRequest('PUT', `/users/${username}/tours/${tour}?status=${status}`, null, success, fail)
  },
  getMyProjects(success, fail) {
    store.dispatch(actions.projects.request());
    api.authenticatedRequest('GET', '/users/me/projects', null, d => success && success(d.projects), fail);
  },
  createEmailSubscription(username, sub, success, fail) {
    api.authenticatedRequest('PUT', `/users/${username}/subscriptions/email/${sub}`, null, success, fail);
  },
  deleteEmailSubscription(username, sub, success, fail) {
    api.authenticatedRequest('DELETE', `/users/${username}/subscriptions/email/${sub}`, null, success, fail);
  },
};
