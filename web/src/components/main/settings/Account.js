import React, { useState } from 'react';
import { Message, Form, Divider, Segment, Icon } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import api from 'api';
import utils from 'utils/utils.js';

function AccountSettings() {
  const [newEmail, setNewEmail] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });

  const updateEmail = () => {
    api.accounts.updateEmail(newEmail, data => {
      setNewEmail('');
      dispatch(actions.users.receive(Object.assign({}, user, { email: data.email })));
    }, err => toast.error(err.message));
  }

  const updatePassword = () => {
    api.accounts.updatePassword(existingPassword, newPassword, () => {
      setExistingPassword('');
      setNewPassword('');
      toast.info('Password updated');
    }, err => toast.error(err.message));
  }

  const deleteAccount = () => {
    const confirm = window.confirm('Really delete your account?');
    if (!confirm) return;
    api.accounts.delete(deletePassword, () => {
      api.auth.logout(() => dispatch(actions.auth.logout()));
      navigate('/');
      toast.info('Sorry to see you go');
    }, err => toast.error(err.message));
  }

  return (
    <div>
      <Segment raised color="blue">
        <h3>Change account email address</h3>
        <p>Change the email address we have on-file for your account.</p>
        <Message><Icon name='info' /> For security, when changing your email address we will notify both your old and new address of the change.</Message>
        <Form>
          <Form.Input label="Current email address" readOnly value={user?.email} />
          <Form.Input label="New email address" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          <Form.Button color="yellow" content="Update email address" onClick={updateEmail} />
        </Form>
      </Segment>

      <Segment raised color="blue">
        <h3>Change account password</h3>
        <p>Update your account password to one that is strong and hard to guess.</p>

        <Form>
          <Form.Input label="Current password" type="password" value={existingPassword} onChange={e => setExistingPassword(e.target.value)} />
          <Form.Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Form.Button color="yellow" content="Update password" onClick={updatePassword} />
        </Form>
      </Segment>

      <Segment raised color="red">
        <h3>Delete account</h3>
        <p>Deleting your account immediately removes your profile, settings, projects, and contents. This action cannot be un-done.</p>
        <Message>
          <p><strong>Before you go...</strong></p>
          <p>We are still a very new service with a way to go in our journey. We'd love to hear your honest feedback about {utils.appName()} and why it wasn't right for you. Please <a href={`mailTo:${process.env.REACT_APP_CONTACT_EMAIL}`} target="_blank" rel="noopener noreferrer">get in touch</a> and we'll do what we can to help out.</p>
        </Message>
        <Divider hidden />
        <p>To continue, please enter your {utils.appName()} account password.</p>

        <Form>
          <Form.Input label="Your account password" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <Form.Button color="red" content="Delete account" onClick={deleteAccount} />
        </Form>
      </Segment>
    </div>
  );
}

export default AccountSettings;
