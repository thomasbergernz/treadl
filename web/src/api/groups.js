import api from '.';
import actions from '../actions';
import { store } from '..';

export const groups = {
  create(data, success, fail) {
    api.authenticatedRequest('POST', '/groups', data, success, fail);
  },
  delete(id, success, fail) {
    api.authenticatedRequest('DELETE', `/groups/${id}`, null, success, fail);
  },
  getMine(success, fail) {
    store.dispatch(actions.groups.request());
    api.authenticatedRequest('GET', '/groups', null, data => success && success(data.groups), fail);
  },
  get(id, success, fail) {
    api.authenticatedRequest('GET', `/groups/${id}`, null, success, fail);
  },
  update(id, data, success, fail) {
    api.authenticatedRequest('PUT', `/groups/${id}`, data, success, fail);
  },
  createMember(id, userId, success, fail) {
    api.authenticatedRequest('PUT', `/groups/${id}/members/${userId}`, null, success, fail);
  },
  getMembers(id, success, fail) {
    api.authenticatedRequest('GET', `/groups/${id}/members`, null, data => success && success(data.members), fail);
  },
  deleteMember(id, userId, success, fail) {
    api.authenticatedRequest('DELETE', `/groups/${id}/members/${userId}`, null, success, fail);
  },
  getProjects(id, success, fail) {
    api.authenticatedRequest('GET', `/groups/${id}/projects`, null, data => success && success(data.projects), fail);
  },
  getEntries(id, success, fail) {
    api.authenticatedRequest('GET', `/groups/${id}/entries`, null, data => success && success(data.entries), fail);
  },
  createEntry(id, data, success, fail) {
    api.authenticatedRequest('POST', `/groups/${id}/entries`, data, success, fail);
  },
  deleteEntry(id, entryId, success, fail) {
    api.authenticatedRequest('DELETE', `/groups/${id}/entries/${entryId}`, null, success, fail);
  },
  createEntryReply(id, entryId, data, success, fail) {
    api.authenticatedRequest('POST', `/groups/${id}/entries/${entryId}/replies`, data, success, fail);
  },
  deleteEntryReply(id, entryId, replyId, success, fail) {
    api.authenticatedRequest('DELETE', `/groups/${id}/entries/${entryId}/replies/${replyId}`, null, success, fail);
  },
  createInvitation(id, user, success, fail) {
    api.authenticatedRequest('POST', `/groups/${id}/invitations`, { user }, success, fail);
  },
  createJoinRequest(id, success, fail) {
    api.authenticatedRequest('POST', `/groups/${id}/requests`, null, success, fail);
  },
  getInvitations(id, success, fail) {
    api.authenticatedRequest('GET', `/groups/${id}/invitations`, null, data => success && success(data.invitations), fail);
  },
  deleteInvitation(id, inviteId, success, fail) {
    api.authenticatedRequest('DELETE', `/groups/${id}/invitations/${inviteId}`, null, success, fail);
  },
};
