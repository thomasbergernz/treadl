import api from 'api';

export const auth = {
  autoLogin(success) {
    const token = localStorage.getItem('auth_token');
    if (token?.length && success) success(token);
  },
  localLogin(token, success) {
    localStorage.setItem('auth_token', token);
    success && success(token);
  },
  localLogout(success) {
    localStorage.removeItem('auth_token');
    success && success();
  },
  register(username, email, password, start, success, fail) {
    start();
    api.unauthenticatedRequest('POST', '/accounts/register', { username, email, password }, (data) => {
      auth.localLogin(data.token, success)
    }, err => fail(err));
  },
  login(email, password, start, success, fail) {
    start();
    api.unauthenticatedRequest('POST', '/accounts/login', { email, password }, (data) => {
      auth.localLogin(data.token, success); 
    }, fail);
  },
  logout(success, fail) {
    api.authenticatedRequest('POST', '/accounts/logout', null, () => {
      auth.localLogout(success);
    }, fail);
  },
  sendPasswordResetEmail(email, success, fail) {
    api.unauthenticatedRequest('POST', '/accounts/password/reset', { email }, success, fail);
  },
  updatePasswordWithToken(token, newPassword, success, fail) {
    api.authenticatedRequest('PUT', '/accounts/password', { token, newPassword }, success, fail);
  },
};
