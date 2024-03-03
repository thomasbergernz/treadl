import api from '.';

export const snippets = {
  create(data, success, fail) {
    api.authenticatedRequest('POST', '/snippets', data, success, fail);
  },
  listForUser(success, fail) {
    api.authenticatedRequest('GET', `/snippets`, null, success, fail);
  },
  delete(snippetId, success, fail) {
    api.authenticatedRequest('DELETE', `/snippets/${snippetId}`, null, success, fail);
  },
};
