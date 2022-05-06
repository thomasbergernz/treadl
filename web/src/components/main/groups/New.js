import React from 'react';
import { Helmet } from 'react-helmet';
import { Icon, Form, Grid, Input, Checkbox, Button, Divider } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import actions from 'actions';
import api from 'api';

import HelpLink from 'components/includes/HelpLink';

function NewGroup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, newGroupName, newGroupDescription, newGroupClosed, loading } = useSelector(state => {
    const { loading, newGroupName, newGroupDescription, newGroupClosed } = state.groups;
    return { user: state.users.users.filter(u => state.auth.currentUserId === u._id)[0], newGroupName, newGroupDescription, newGroupClosed, loading };
  });

  const createGroup = () => {
    dispatch(actions.groups.request(true));
    api.groups.create({ name: newGroupName, description: newGroupDescription, closed: newGroupClosed }, (group) => {
      dispatch(actions.groups.receiveGroup(group));
      dispatch(actions.groups.request(false));
      navigate(`/groups/${group._id}/members`);
    }, (err) => {
      dispatch(actions.groups.request(false));
      toast.error(err.message);
    });
  }

  return (
    <Grid stackable centered>
      <Helmet title='Create Group' />
      <Grid.Column computer={8}>
        <h2 style={{ marginTop: 40 }}>
          <Icon name="users" /> Create a new group
        </h2>
        <p>Groups are great for communities of weavers and makers, or to help people of similar interests collaborate and come together.</p>

        <HelpLink link={`${process.env.REACT_APP_SUPPORT_ROOT}Groups#creating-a-new-group`} />

        <Divider section />

        <h3>About your group</h3>
        <p>Give your group a short name. You can change this whenever you like.</p>
        <Input autoFocus type="text" fluid onChange={e => dispatch(actions.groups.updateNewGroupName(e.target.value))} value={newGroupName} />
        <Divider hidden />
        <p><strong>Optional:</strong> Write a short description to describe your group to others.</p>
        <Form><Form.TextArea placeholder="Group description (optional)..." value={newGroupDescription} onChange={e => dispatch(actions.groups.updateNewGroupDescription(e.target.value))} /></Form>

        <Checkbox style={{marginTop: 40}} toggle checked={newGroupClosed} label="Make this group a closed group" onChange={(e,c) => dispatch(actions.groups.updateNewGroupClosed(c.checked))} />
        <div style={{ marginLeft: 63, color: 'rgb(150,150,150)' }}>
          <p>Closed groups are more restrictive and new members must be invited or approved to join. Members can join non-closed groups without being invited.</p>
        </div>

        <Divider section />
        <p>You can add and invite others to join your group after you've created it.</p>

        <div style={{textAlign: 'right'}}>
          <Button basic onClick={() => navigate(-1)}>Cancel</Button>
          <Button color="teal" icon="check" content="Create group" onClick={createGroup} loading={loading} />
        </div>
      </Grid.Column>
    </Grid>
  );
}

export default NewGroup;
