import api from '.';

export const search = {
  all(query, success, fail) {
    api.authenticatedRequest('GET', `/search?query=${query}`, null, success, fail);
  },
  users(username, success, fail) {
    api.authenticatedRequest('GET', `/search/users?username=${username}`, null, data => success && success(data.users), fail);
  },
  discover(count, success, fail) {
    api.authenticatedRequest('GET', `/search/discover?count=${count || 3}`, null, data => success && success(data), fail);
  },
  explore(page, success, fail) {
    api.unauthenticatedRequest('GET', `/search/explore?page=${page || 1}`, null, data => success && success(data), fail);
  },
};
