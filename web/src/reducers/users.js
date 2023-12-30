import actions from '../actions';

const initialState = {
  loading: false,
  errorMessage: '',
  users: [],
};

function users(state = initialState, action) {
  switch (action.type) {
    case actions.users.REQUEST_USERS:
      return Object.assign({}, state, { loading: true, errorMessage: '' });

    case actions.users.REQUEST_FAILED:
      return Object.assign({}, state, { loading: false, errorMessage: action.error && action.error.message });

    case actions.users.RECEIVE_USER: {
      const users = [];
      let found = false;
      state.users.forEach((user) => {
        if (user._id === action.user._id) {
          user = Object.assign({}, user, action.user);
          found = true;
        }
        users.push(user);
      });
      if (!found) users.push(action.user);
      return Object.assign({}, state, {
        loading: false,
        errorMessage: '',
        users,
      });
    }
    case actions.users.UPDATE_USER:
      return {
        users: state.users.map((user) => {
          if (user._id === action.id) return Object.assign({}, user, action.data);
          return user;
        }),
      };

    case actions.users.UPDATE_USERNAME: {
      const users = Object.assign([], state.users).map(u => {
        if (u._id === action.id) return Object.assign({}, u, { username: action.username });
        return u;
      });
      return Object.assign({}, state, { users });
    }
    case actions.users.JOIN_GROUP: {
      const users = Object.assign([], state.users.map(u => {
        if (u._id === action.id) {
          if (!u.groups) u.groups = [];
          if (u.groups.indexOf(action.groupId) === -1) u.groups.push(action.groupId);
          if (!u.subscriptions) u.subscriptions = {};
          if (!u.subscriptions.email) u.subscriptions.email = [];
          if (u.subscriptions.email.indexOf('groupFeed-' + action.groupId) === -1) u.subscriptions.email.push('groupFeed-' + action.groupId);
          return Object.assign({}, u);
        }
        return u;
      }));
      return Object.assign({}, state, { users });
    }
    case actions.users.LEAVE_GROUP: {
      const users = Object.assign([], state.users.map(u => {
        if (u._id === action.id) {
          u.groups.splice(u.groups.indexOf(action.groupId), 1);
          return Object.assign({}, u);
        }
        return u;
      }));
      return Object.assign({}, state, { users });
    }
    case actions.users.UPDATE_SUBSCRIPTIONS: {
      const users = Object.assign([], state.users.map(u => {
        if (u._id === action.id) {
          return Object.assign({}, u, { subscriptions: action.subscriptions });
        }
        return u;
      }));
      return Object.assign({}, state, { users });
    }

    default:
      return state;
  }
}

export default users;
