export default {

  UPDATE_LOADING: 'UPDATE_LOADING',
  UPDATE_POST: 'UPDATE_POST',
  ADD_ATTACHMENT: 'ADD_ATTACHMENT',
  DELETE_ATTACHMENT: 'DELETE_ATTACHMENT',
  ATTACHMENT_UPLOADING: 'ATTACHMENT_UPLOADING',
  CLEAR: 'CLEAR',
  UPDATE_POSTING: 'UPDATE_POSTING',
  UPDATE_REPLYING_TO: 'UPDATE_REPLYING_TO',

  updatePost(content) {
    return { type: this.UPDATE_POST, content };
  },

  addAttachment(attachment) {
    return { type: this.ADD_ATTACHMENT, attachment };
  },

  deleteAttachment(attachment) {
    return { type: this.DELETE_ATTACHMENT, attachment };
  },

  clear() {
    return { type: this.CLEAR };
  },

  updateAttachmentUploading(isUploading) {
    return { type: this.ATTACHMENT_UPLOADING, isUploading };
  },

  updatePosting(posting) {
    return { type: this.UPDATE_POSTING, posting };
  },

  updateReplyingTo(postId) {
    return { type: this.UPDATE_REPLYING_TO, postId };
  },

};
