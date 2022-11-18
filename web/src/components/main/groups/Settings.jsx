import React from 'react';
import { Header, Button, Divider, Segment, Form,  } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import utils from '../../../utils/utils.js';
import actions from '../../../actions';
import api from '../../../api';

function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { loading, group } = useSelector(state => {
    const { loading } = state.groups;
    const group = state.groups.groups.filter(g => g._id === id)[0];
    return { loading, group };
  });

  const saveGroup = () => {
    dispatch(actions.groups.request(true));
    const { _id, name, description, closed } = group;
    api.groups.update(_id, { name, description, closed }, () => {
      dispatch(actions.groups.request(false));
      toast.info('Group updated');
    }, err => {
      toast.error(err.message);
      dispatch(actions.groups.request(false));
    });
  }
  const deleteGroup = () => {
    utils.confirm('Really delete this group?', 'You\'ll lose all entries in the group feed and anything else you\'ve added to it.').then(() => {
      api.groups.delete(group._id, () => {
        toast.info('Group deleted');
        dispatch(actions.groups.deleteGroup(group._id));
        navigate(`/`);
      }, err => toast.error(err.message));
    }, () => {});
  }

  return (
    <div>
      <Segment color='blue'>
        <Header>About this group</Header>
        <Form>
          <Form.Input label='Group name' value={group.name} onChange={e => dispatch(actions.groups.updateGroup(group._id, { name: e.target.value }))} />
          <Form.TextArea label='Group description' value={group.description} onChange={e => dispatch(actions.groups.updateGroup(group._id, { description: e.target.value }))}/>
          <Form.Checkbox toggle checked={group.closed} label="Closed group" onChange={(e,c) => dispatch(actions.groups.updateGroup(group._id, { closed: c.checked }))} />
          <div style={{ marginLeft: 63, color: 'rgb(150,150,150)' }}>
            <p>Closed groups are more restrictive and new members must be invited or approved to join. Members can join non-closed groups without being invited.</p>
          </div>

          <Divider hidden />
          <Form.Button loading={loading} color='teal' icon='check' content='Save changes' onClick={saveGroup}/>
        </Form>
      </Segment>

      <Segment color='red'>
        <Header>Delete this group</Header>
        <p>This action will also delete all feed entries and anything else you've added. We'll remove all members and administrators from the group and then safely delete it.</p>
        <Button color='red' icon='trash' content='Delete group' onClick={deleteGroup} />
      </Segment>
    </div>
  )
}

export default Settings;
