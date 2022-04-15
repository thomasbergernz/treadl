export default {

  REQUEST_PROJECTS: 'REQUEST_PROJECTS',
  REQUEST_FAILED: 'REQUEST_FAILED',
  EDIT_DESCRIPTION: 'EDIT_DESCRIPTION',
  RECEIVE_PROJECTS: 'RECEIVE_PROJECTS',
  RECEIVE_PROJECT: 'RECEIVE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',

  request() {
    return { type: this.REQUEST_PROJECTS };
  },

  requestFailed(error) {
    return { type: this.REQUEST_FAILED, error };
  },

  editDescription(editingDescription) {
    return { type: this.EDIT_DESCRIPTION, editingDescription };
  },

  receiveProjects(projects) {
    return { type: this.RECEIVE_PROJECTS, projects };
  },

  receiveProject(project) {
    return { type: this.RECEIVE_PROJECT, project };
  },

  deleteProject(id) {
    return { type: this.DELETE_PROJECT, id };
  },

  updateProject(id, data) {
    return { type: this.UPDATE_PROJECT, id, data };
  },
};
