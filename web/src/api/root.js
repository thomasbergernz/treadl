import api from '.';

export const root = {
  getUsers(success, fail) {
    api.authenticatedRequest('GET', `/root/users`, null, success, fail);
  },
  getGroups(success, fail) {
    api.authenticatedRequest('GET', `/root/groups`, null, success, fail);
  },
};
