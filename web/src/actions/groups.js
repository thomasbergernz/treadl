export default {

  UPDATE_NEW_GROUP_NAME: 'UPDATE_NEW_GROUP_NAME',
  UPDATE_NEW_GROUP_DESCRIPTION: 'UPDATE_NEW_GROUP_DESCRIPTION',
  UPDATE_NEW_GROUP_CLOSED: 'UPDATE_NEW_GROUP_CLOSED',
  REQUEST_GROUPS: 'REQUEST_GROUPS',
  REQUEST_FAILED: 'REQUEST_FAILED',
  RECEIVE_GROUPS: 'RECEIVE_GROUPS',
  RECEIVE_GROUP: 'RECEIVE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  UPDATE_LOADING_ENTRIES: 'UPDATE_LOADING_ENTRIES',
  UPDATE_NEW_ENTRY: 'UPDATE_NEW_ENTRY',
  ADD_NEW_ENTRY_ATTACHMENT: 'ADD_NEW_ENTRY_ATTACHMENT',
  DELETE_NEW_ENTRY_ATTACHMENT: 'DELETE_NEW_ENTRY_ATTACHMENT',
  CLEAR_NEW_ENTRY: 'CLEAR_NEW_ENTRY',
  NEW_ENTRY_ATTACHMENT_UPLOADING: 'NEW_ENTRY_ATTACHMENT_UPLOADING',
  UPDATE_NEW_ENTRY_POSTING: 'UPDATE_NEW_ENTRY_POSTING',
  RECEIVE_ENTRY: 'RECEIVE_ENTRY',
  DELETE_ENTRY: 'DELETE_ENTRY',
  UPDATE_REPLYING_TO_ENTRY: 'UPDATE_REPLYING_TO_ENTRY',
  UPDATE_PROJECT_FILTER: 'UPDATE_PROJECT_FILTER',

  updateNewGroupName(name) {
    return { type: this.UPDATE_NEW_GROUP_NAME, name };
  },
  updateNewGroupDescription(description) {
    return { type: this.UPDATE_NEW_GROUP_DESCRIPTION, description };
  },
  updateNewGroupClosed(closed) {
    return { type: this.UPDATE_NEW_GROUP_CLOSED, closed };
  },

  request(loading) {
    return { type: this.REQUEST_GROUPS, loading };
  },

  requestFailed(error) {
    return { type: this.REQUEST_FAILED, error };
  },

  receiveGroups(groups) {
    return { type: this.RECEIVE_GROUPS, groups };
  },

  receiveGroup(group) {
    return { type: this.RECEIVE_GROUP, group };
  },

  deleteGroup(id) {
    return { type: this.DELETE_GROUP, id };
  },

  updateGroup(id, data) {
    return { type: this.UPDATE_GROUP, id, data };
  },

  updateLoadingEntries(loadingEntries) {
    return { type: this.UPDATE_LOADING_ENTRIES, loadingEntries };
  },

  updateNewEntry(content) {
    return { type: this.UPDATE_NEW_ENTRY, content };
  },

  addNewEntryAttachment(attachment) {
    return { type: this.ADD_NEW_ENTRY_ATTACHMENT, attachment };
  },

  deleteNewEntryAttachment(attachment) {
    return { type: this.DELETE_NEW_ENTRY_ATTACHMENT, attachment };
  },

  clearNewEntry() {
    return { type: this.CLEAR_NEW_ENTRY };
  },

  updateNewEntryAttachmentUploading(isUploading) {
    return { type: this.NEW_ENTRY_ATTACHMENT_UPLOADING, isUploading };
  },

  updateNewEntryPosting(newEntryPosting) {
    return { type: this.UPDATE_NEW_ENTRY_POSTING, newEntryPosting };
  },

  receiveEntry(entry) {
    return { type: this.RECEIVE_ENTRY, entry };
  },

  deleteEntry(entryId) {
    return { type: this.DELETE_ENTRY, entryId };
  },

  updateReplyingToEntry(entryId) {
    return { type: this.UPDATE_REPLYING_TO_ENTRY, entryId };
  },

  updateProjectFilter(projectFilter) {
    return { type: this.UPDATE_PROJECT_FILTER, projectFilter };
  },

};
