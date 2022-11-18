import actions from '../actions';

const initialState = {
  loading: false,
  errorMessage: '',
  newGroupName: 'My group',
  newGroupDescription: '',
  newGroupClosed: false,
  loadingEntries: false,
  newEntry: '',
  newEntryAttachments: [],
  newEntryAttachmentUploading: false,
  newEntryPosting: false,
  replyingToEntry: '',
  projectFilter: '',
  groups: [],
  entries: [],
};

function groups(state = initialState, action) {
  switch (action.type) {
    case actions.groups.UPDATE_NEW_GROUP_NAME:
      return Object.assign({}, state, { newGroupName: action.name });
    case actions.groups.UPDATE_NEW_GROUP_DESCRIPTION:
      return Object.assign({}, state, { newGroupDescription: action.description });
    case actions.groups.UPDATE_NEW_GROUP_CLOSED:
      return Object.assign({}, state, { newGroupClosed: action.closed });
    case actions.groups.REQUEST_GROUPS:
      return Object.assign({}, state, { loading: action.loading ?? true });

    case actions.users.REQUEST_FAILED:
      return Object.assign({}, state, { loading: false, errorMessage: action.error && action.error.message });

    case actions.groups.RECEIVE_GROUPS: {
      const groups = Object.assign([], state.groups);
      action.groups.forEach(g => {
        let found = false;
        groups.forEach(g2 => {
          if (g2._id === g._id) {
            found = true;
            g2 = Object.assign({}, g2, g);
          }
        });
        if (!found) groups.push(g);
      });
      return Object.assign({}, state, { loading: false, errorMessage: '', groups });
    }

    case actions.groups.RECEIVE_GROUP: {
      const groups = [];
      let found = false;
      state.groups.forEach((group) => {
        if (group._id === action.group._id) {
          groups.push(action.group);
          found = true;
        } else groups.push(group);
      });
      if (!found) groups.push(action.group);
      return Object.assign({}, state, { loading: false, errorMessage: '', groups });
    }
    case actions.groups.DELETE_GROUP:
      let index;
      state.groups.forEach((p, i) => {
        if (p._id === action.id) index = i;
      });
      if (index > -1) state.groups.splice(index, 1);
      return Object.assign({}, state, {
        loading: false,
        groups: state.groups,
      });

    case actions.groups.UPDATE_GROUP:
      return Object.assign({}, state, {
        groups: state.groups.map((p) => {
          if (p._id === action.id) return Object.assign({}, p, action.data);
          return Object.assign({}, p);
        }),
      });
    case actions.groups.UPDATE_LOADING_ENTRIES:
      return Object.assign({}, state, { loadingEntries: action.loadingEntries });

    case actions.groups.UPDATE_NEW_ENTRY:
      return Object.assign({}, state, { newEntry: action.content });

    case actions.groups.ADD_NEW_ENTRY_ATTACHMENT: {
      const attachments = Object.assign([], state.newEntryAttachments);
      attachments.push(action.attachment);
      return Object.assign({}, state, { newEntryAttachments: attachments });
    }

    case actions.groups.DELETE_NEW_ENTRY_ATTACHMENT: {
      const attachments = Object.assign([], state.newEntryAttachments).filter(a => a.storedName !== action.attachment.storedName);
      return Object.assign({}, state, { newEntryAttachments: attachments });
    }

    case actions.groups.NEW_ENTRY_ATTACHMENT_UPLOADING:
      return Object.assign({}, state, { newEntryAttachmentUploading: action.isUploading });
    case actions.groups.CLEAR_NEW_ENTRY:
      return Object.assign({}, state, { newEntryAttachments: [], newEntry: '' });
    case actions.groups.UPDATE_NEW_ENTRY_POSTING:
      return Object.assign({}, state, { newEntryPosting: action.newEntryPosting });

    case actions.groups.RECEIVE_ENTRY: {
      let found = false;
      const entries = state.entries.map(e => {
        if (e._id === action.entry._id) {
          found = true;
          return action.entry;
        }
        return e;
      });
      if (!found) entries.push(action.entry);
      return Object.assign({}, state, { entries });
    }

    case actions.groups.UPDATE_REPLYING_TO_ENTRY:
      return Object.assign({}, state, { replyingToEntry: action.entryId });

    case actions.groups.UPDATE_PROJECT_FILTER:
      return Object.assign({}, state, { projectFilter: action.projectFilter });

    case actions.groups.DELETE_ENTRY: {
      return Object.assign({}, state, { entries: state.entries.filter(e => e._id !== action.entryId) });
    }

    default:
      return state;
  }
}

export default groups;
