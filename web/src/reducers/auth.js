import actions from 'actions';

const initialState = {
  loading: false,
  isAuthenticated: false,
  isAuthenticating: false,
  isAuthenticatingType: null,
  authToken: null,
  currentUserId: null,
  error: null,
};

function auth(state = initialState, action) {
  switch (action.type) {
    case actions.auth.OPEN_LOGIN: 
      return Object.assign({}, state, { isAuthenticating: true, isAuthenticatingType: 'login' });
    case actions.auth.OPEN_REGISTER:
      return Object.assign({}, state, { isAuthenticating: true, isAuthenticatingType: 'register' });
    case actions.auth.CLOSE_AUTHENTICATION:
      return Object.assign({}, state, { isAuthenticating: false });
    case actions.auth.LOGIN_REQUEST:
      return Object.assign({}, state, {
        loading: true,
        isAuthenticated: false,
      });
    case actions.auth.LOGIN_SUCCESS:
      const base64Token = action.token.split('.')[1].replace('-', '+').replace('_', '/');
      const tokenData = JSON.parse(window.atob(base64Token));
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        error: '',
        currentUserId: tokenData.sub,
        authToken: action.token,
      });
    case actions.auth.LOGIN_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.error,
        currentUserId: null,
        authToken: null
      });
    case actions.auth.UPDATE_PLAN: {
      const user = Object.assign({}, state.user);
      user.planId = action.planId;
      return Object.assign({}, state, { user });
    }
    case actions.auth.LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        error: null,
        isAuthenticated: false,
        authToken: null,
        currentUserId: null,
      });
    
    default:
      return state;
  }
}

export default auth;
