import actions from '../actions';
import { store } from '../';
import { auth } from './auth';
import { accounts } from './accounts';
import { users } from './users';
import { projects } from './projects';
import { objects } from './objects';
import { snippets } from './snippets';
import { uploads } from './uploads';
import { groups } from './groups';
import { search } from './search';
import { invitations } from './invitations';
import { root } from './root';

export const api = {

  token: null,

  req(method, path, data, success, fail, withAuth, options) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${import.meta.env.VITE_API_URL}${path}`);
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

  auth, accounts, users, projects, objects, snippets, uploads, groups, search, invitations, root
};

export default api;
