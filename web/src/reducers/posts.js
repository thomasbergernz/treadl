import actions from '../actions';

const initialState = {
  loading: false,
  post: '',
  attachments: [],
  attachmentUploading: false,
  posting: false,
  replyingTo: '',
};

function posts(state = initialState, action) {
  switch (action.type) {
    case actions.posts.UPDATE_POST:
      return Object.assign({}, state, { post: action.content });

    case actions.posts.ADD_ATTACHMENT: {
      const newAttachments = Object.assign([], state.attachments);
      newAttachments.push(action.attachment);
      return Object.assign({}, state, { attachments: newAttachments });
    }

    case actions.posts.DELETE_ATTACHMENT: {
      const newAttachments = Object.assign([], state.attachments).filter(a => a.storedName !== action.attachment.storedName);
      return Object.assign({}, state, { attachments: newAttachments });
    }

    case actions.posts.ATTACHMENT_UPLOADING:
      return Object.assign({}, state, { attachmentUploading: action.isUploading });

    case actions.posts.CLEAR:
      return Object.assign({}, state, { attachments: [], post: '' });

    case actions.posts.UPDATE_POSTING:
      return Object.assign({}, state, { posting: action.posting });

    case actions.posts.UPDATE_REPLYING_TO:
      return Object.assign({}, state, { replyingTo: action.postId });

    default:
      return state;
  }
}

export default posts;
