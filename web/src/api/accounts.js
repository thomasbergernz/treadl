import api from 'api';

export const accounts = {
  updateEmail(email, success, fail) {
    api.authenticatedRequest('PUT', '/accounts/email', { email }, success, fail);
  },
  updatePassword(currentPassword, newPassword, success, fail) {
    api.authenticatedRequest('PUT', '/accounts/password', { currentPassword, newPassword }, success, fail);
  },
  delete(password, success, fail) {
    api.authenticatedRequest('DELETE', '/accounts', { password }, success, fail);
  },
};
