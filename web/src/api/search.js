import api from 'api';

export const search = {
  all(query, success, fail) {
    api.authenticatedRequest('GET', `/search?query=${query}`, null, success, fail);
  },
  users(username, success, fail) {
    api.authenticatedRequest('GET', `/search/users?username=${username}`, null, data => success && success(data.users), fail);
  },
};
