import api from 'api';

export const objects = {
  delete(id, success, fail) {
    api.authenticatedRequest('DELETE', `/objects/${id}`, null, success, fail);
  },
  get(id, success, fail) {
    api.authenticatedRequest('GET', `/objects/${id}`, null, success, fail);
  },
  update(id, data, success, fail) {
    api.authenticatedRequest('PUT', `/objects/${id}`, data, success, fail);
  },
  copyTo(id, projectId, success, fail) {
    api.authenticatedRequest('PUT', `/objects/${id}/projects/${projectId}`, null, success, fail);
  },
  getWif(id, success, fail) {
    api.authenticatedRequest('GET', `/objects/${id}/wif`, null, success, fail);
  },
  getPdf(id, success, fail) {
    api.authenticatedRequest('GET', `/objects/${id}/pdf`, null, success, fail);
  },
  createComment(id, data, success, fail) {
    api.authenticatedRequest('POST', `/objects/${id}/comments`, data, success, fail);
  },
  getComments(id, success, fail) {
    api.authenticatedRequest('GET', `/objects/${id}/comments`, null, success, fail);
  },
  deleteComment(id, commentId, success, fail) {
    api.authenticatedRequest('DELETE', `/objects/${id}/comments/${commentId}`, null, success, fail);
  },
};
