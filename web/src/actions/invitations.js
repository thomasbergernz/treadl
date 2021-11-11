export default {

  RECEIVE_INVITATIONS: 'RECEIVE_INVITATIONS',
  DISMISS: 'DISMISS',
  DISMISS_BY_GROUP: 'DISMISS_BY_GROUP',

  receiveInvitations(invitations) {
    return { type: this.RECEIVE_INVITATIONS, invitations };
  },

  dismiss(id) {
    return { type: this.DISMISS, id };
  },

  dismissByGroup(groupId) {
    return { type: this.DISMISS_BY_GROUP, groupId };
  },

};
