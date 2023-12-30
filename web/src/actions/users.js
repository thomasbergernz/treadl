import actions from './';
import { store } from '../index';

export default {

  REQUEST_USERS: 'REQUEST_USERS',
  REQUEST_FAILED: 'REQUEST_FAILED',
  RECEIVE_USER: 'RECEIVE_USERS',
  RECEIVE_EXPLORE: 'RECEIVE_EXPLORE',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_USERNAME: 'UPDATE_USERNAME',
  JOIN_GROUP: 'JOIN_GROUP',
  LEAVE_GROUP: 'LEAVE_GROUP',
  UPDATE_SUBSCRIPTIONS: 'UPDATE_SUBSCRIPTIONS',

  request() {
    return { type: this.REQUEST_USERS };
  },

  requestFailed(error) {
    return { type: this.REQUEST_FAILED, error };
  },

  receive(user) {
    return { type: this.RECEIVE_USER, user };
  },
  
  receiveExplore(users) {
    return { type: this.RECEIVE_EXPLORE, users };
  },

  update(id, data) {
    return { type: this.UPDATE_USER, id, data };
  },

  updateUsername(id, username) {
    return { type: this.UPDATE_USERNAME, id, username };
  },

  joinGroup(id, groupId) {
    store.dispatch(actions.invitations.dismissByGroup(groupId));
    return { type: this.JOIN_GROUP, id, groupId };
  },

  leaveGroup(id, groupId) {
    return { type: this.LEAVE_GROUP, id, groupId };
  },

  updateSubscriptions(id, subscriptions) {
    return { type: this.UPDATE_SUBSCRIPTIONS, id, subscriptions };
  },
};
