import api from 'api';

export const projects = {
  create(data, success, fail) {
    api.authenticatedRequest('POST', '/projects', data, success, fail);
  },
  get(projectPath, success, fail) {
    api.authenticatedRequest('GET', `/projects/${projectPath}`, null, success, fail);
  },
  delete(projectPath, success, fail) {
    api.authenticatedRequest('DELETE', `/projects/${projectPath}`, null, success, fail);
  },
  update(projectPath, update, success, fail) {
    api.authenticatedRequest('PUT', `/projects/${projectPath}`, update, success, fail);
  },
  createObject(projectPath, data, success, fail) {
    api.authenticatedRequest('POST', `/projects/${projectPath}/objects`, data, success, fail);
  },
  getObjects(projectPath, success, fail) {
    api.authenticatedRequest('GET', `/projects/${projectPath}/objects`, null, data => success(data && data.objects), fail);
  },
};
