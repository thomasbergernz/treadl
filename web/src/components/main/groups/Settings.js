import React from 'react';
import { Header, Button, Divider, Segment, Form,  } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

function Settings({ user, group, loading, onUpdateGroupLoading, onUpdateGroup, onDeleteGroup, history }) {
  const navigate = useNavigate();

  const saveGroup = () => {
    onUpdateGroupLoading(true);
    const { _id, name, description, closed } = group;
    api.groups.update(_id, { name, description, closed }, () => {
      onUpdateGroupLoading(false);
      toast.info('Group updated');
    }, err => {
      toast.error(err.message);
      onUpdateGroupLoading(false);
    });
  }
  const deleteGroup = () => {
    utils.confirm('Really delete this group?', 'You\'ll lose all entries in the group feed and anything else you\'ve added to it.').then(() => {
      api.groups.delete(group._id, () => {
        toast.info('Group deleted');
        onDeleteGroup(group._id);
        navigate(`/`);
      }, err => toast.error(err.message));
    }, () => {});
  }

  return (
    <div>
      <Segment color='blue'>
        <Header>About this group</Header>
        <Form>
          <Form.Input label='Group name' value={group.name} onChange={e => onUpdateGroup(group._id, { name: e.target.value })} />
          <Form.TextArea label='Group description' value={group.description} onChange={e => onUpdateGroup(group._id, { description: e.target.value })}/>
          <Form.Checkbox toggle checked={group.closed} label="Closed group" onChange={(e,c) => onUpdateGroup(group._id, { closed: c.checked })} />
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

const mapStateToProps = state => {
  const { loading } = state.groups;
  return { loading };
};
const mapDispatchToProps = dispatch => ({
  onUpdateGroup: (id, update) => dispatch(actions.groups.updateGroup(id, update)),
  onUpdateGroupLoading: l => dispatch(actions.groups.request(l)),
  onDeleteGroup: id => dispatch(actions.groups.deleteGroup(id)),
});
const SettingsContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(Settings);

export default SettingsContainer;
