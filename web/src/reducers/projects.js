import actions from '../actions';

const initialState = {
  loading: false,
  errorMessage: '',
  editingDescription: false,
  projects: [],
};

function projects(state = initialState, action) {
  switch (action.type) {
    case actions.projects.REQUEST_PROJECTS:
      return Object.assign({}, state, { loading: true });

    case actions.projects.REQUEST_FAILED:
      return Object.assign({}, state, { loading: false, errorMessage: action.error && action.error.message });
    case actions.projects.EDIT_DESCRIPTION:
      return Object.assign({}, state, { editingDescription: action.editingDescription });
    case actions.projects.RECEIVE_PROJECTS: {
      const projects = Object.assign([], state.projects);
      action.projects.forEach(g => {
        let found = false;
        projects.forEach(g2 => {
          if (g2._id === g._id) {
            found = true;
            g2 = Object.assign({}, g2, g);
          }
        });
        if (!found) projects.push(g);
      });
      return Object.assign({}, state, { loading: false, errorMessage: '', projects });
    }

    case actions.projects.RECEIVE_PROJECT: {
      const projects = [];
      let found = false;
      state.projects.forEach((project) => {
        if (project._id === action.project._id) {
          projects.push(action.project);
          found = true;
        } else projects.push(project);
      });
      if (!found) projects.push(action.project);
      return Object.assign({}, state, { loading: false, projects, errorMessage: '' });
    }
    case actions.projects.DELETE_PROJECT:
      let index;
      state.projects.forEach((p, i) => {
        if (p._id === action.id) index = i;
      });
      if (index > -1) state.projects.splice(index, 1);
      return Object.assign({}, state, {
        loading: false,
        projects: state.projects,
      });

    case actions.projects.UPDATE_PROJECT:
      return Object.assign({}, state, {
        projects: state.projects.map((p) => {
          if (p._id === action.id) return Object.assign({}, p, action.data);
          return Object.assign({}, p);
        }),
      });

    default:
      return state;
  }
}

export default projects;
