import actions from 'actions';
import { store } from 'index.js';
import { auth } from './auth.js';
import { accounts } from './accounts.js';
import { users } from './users.js';
import { projects } from './projects.js';
import { objects } from './objects.js';
import { uploads } from './uploads.js';
import { groups } from './groups.js';
import { search } from './search.js';
import { invitations } from './invitations.js';
import { root } from './root.js';

export const api = {

  token: null,

  req(method, path, data, success, fail, withAuth, options) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${process.env.REACT_APP_API_URL}${path}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (withAuth && api.token) {
      xhr.setRequestHeader('Authorization', `Bearer ${api.token}`);
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let response;
          if (options && options.plain) response = xhr.responseText;
          else {
            try { response = JSON.parse(xhr.responseText); } catch (err) { console.log(err); }
          }
          if (success) success(response);
        } else {
          if (xhr.status === 401) {
            if (api.token) auth.localLogout(() => store.dispatch(actions.auth.logout()));
            return fail && fail({ status: 401, message: 'Authorisation is needed' });
          }
          let message;
          try { message = JSON.parse(xhr.responseText).message; } catch (err) { if (fail) fail({ status: xhr.status, message: 'There was a problem with this request' }); }
          if (fail) fail({ status: xhr.status, message });
        }
      }
    };
    xhr.send(data && JSON.stringify(data));
  },

  unauthenticatedRequest(method, path, data, success, fail, options) {
    api.req(method, path, data, success, fail, false, options);
  },

  authenticatedRequest(method, path, data, success, fail, options ) {
    api.req(method, path, data, success, fail, true, options);
  },

  auth, accounts, users, projects, objects, uploads, groups, search, invitations, root
};

export default api;
