export default {

  RECEIVE_OBJECTS: 'RECEIVE_OBJECTS',
  RECEIVE_OBJECT: 'RECEIVE_OBJECT',
  RECEIVE_EXPLORE_OBJECTS: 'RECEIVE_EXPLORE_OBJECTS',
  CREATE_OBJECT: 'CREATE_OBJECT',
  UPDATE_OBJECT: 'UPDATE_OBJECT',
  DELETE_OBJECT: 'DELETE_OBJECT',
  SELECT_OBJECT: 'SELECT_OBJECT',
  UPDATE_EDITOR: 'UPDATE_EDITOR',
  RECEIVE_SNIPPET: 'RECEIVE_SNIPPET',
  RECEIVE_COMMENT: 'RECEIVE_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',

  receiveMultiple(objects) {
    return { type: this.RECEIVE_OBJECTS, objects };
  },

  receive(object) {
    return { type: this.RECEIVE_OBJECT, object };
  },
  
  receiveExplore(objects) {
    return { type: this.RECEIVE_EXPLORE_OBJECTS, objects };
  },

  create(object) {
    return { type: this.CREATE_OBJECT, object };
  },

  update(id, field, value) {
    return {
      type: this.UPDATE_OBJECT, id, field, value,
    };
  },

  delete(id) {
    return { type: this.DELETE_OBJECT, id };
  },

  select(id) {
    return { type: this.SELECT_OBJECT, id };
  },

  updateEditor(editor) {
    return { type: this.UPDATE_EDITOR, editor };
  },

  receiveSnippet(snippet) {
    return { type: this.RECEIVE_SNIPPET, snippet };
  },

  receiveComment(comment) {
    return { type: this.RECEIVE_COMMENT, comment };
  },
  deleteComment(commentId) {
    return { type: this.DELETE_COMMENT, commentId };
  },
};
