import actions from '../actions';

const initialState = {
  invitations: [],
};

function invitations(state = initialState, action) {
  switch (action.type) {
    case actions.invitations.RECEIVE_INVITATIONS: {
      const invitations = Object.assign([], state.invitations);
      action.invitations.forEach(i => {
        let found = false;
        invitations.map(i2 => {
          if (i2._id === i._id) {
            found = true;
            return Object.assign({}, i2, i);
          }
          return i2;
        });
        if (!found) invitations.push(i);
      });
      return Object.assign({}, state, { invitations });
    }

    case actions.invitations.DISMISS: {
      const invitations = Object.assign([], state.invitations).filter(i => i._id !== action.id);
      return Object.assign({}, state, { invitations });
    }

    case actions.invitations.DISMISS_BY_GROUP: {
      const invitations = Object.assign([], state.invitations).filter(i => i.typeId !== action.groupId);
      return Object.assign({}, state, { invitations });
    }

    default:
      return state;
  }
}

export default invitations;
