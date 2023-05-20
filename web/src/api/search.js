import api from '.';

export const search = {
  all(query, success, fail) {
    api.authenticatedRequest('GET', `/search?query=${query}`, null, success, fail);
  },
  users(username, success, fail) {
    api.authenticatedRequest('GET', `/search/users?username=${username}`, null, data => success && success(data.users), fail);
  },
  discover(success, fail) {
    api.authenticatedRequest('GET', `/search/discover`, null, data => success && success(data), fail);
  },
  explore(success, fail) {
    api.unauthenticatedRequest('GET', `/search/explore`, null, data => success && success(data), fail);
  },
};
