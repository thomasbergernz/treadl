import React, { useState } from 'react';
import { Message, Input, Segment, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import api from 'api';
import utils from 'utils/utils.js';

function IdentitySettings() {
  const [newUsername, setNewUsername] = useState('');
  const dispatch = useDispatch();
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });

  const updateUsername = () => {
    api.users.update(user.username, { username: newUsername }, (user) => {
      dispatch(actions.users.updateUsername(user._id, newUsername));
      toast.info('Username updated');
      setNewUsername('');
    }, err => toast.error(err.message));
  };

  return (
    <Segment raised color="blue">
      <h3>Username</h3>
      <p>Change the username you use for your profile and to login to {utils.appName()}.</p>

      <Message>
        <p><strong>Changing your username can have unintended side-effects</strong></p>
        <p>Project URLs and other links are associated with your username, so any links to projects you've shared may not work correctly after you've changed your username.</p>
        <p>If you change your username, your old one will become available to be taken by somebody else.</p>
      </Message>
      <Input
        type="text" value={newUsername}
        onChange={e => setNewUsername(e.target.value)}
        action=<Button color="yellow" content="Set new username" onClick={updateUsername} />
      />
    </Segment>
  );
}

export default IdentitySettings;
