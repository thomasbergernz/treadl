import api from 'api';

export const invitations = {
  get(success, fail) {
    api.authenticatedRequest('GET', `/invitations`, null, success, fail);
  },
  accept(id, success, fail) {
    api.authenticatedRequest('PUT', `/invitations/${id}`, null, success, fail);
  },
  decline(id, success, fail) {
    api.authenticatedRequest('DELETE', `/invitations/${id}`, null, success, fail);
  },
};
