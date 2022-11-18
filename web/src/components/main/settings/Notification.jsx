import React from 'react';
import { Label, Table, Checkbox, Divider, Segment } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import actions from '../../../actions';
import api from '../../../api';
import utils from '../../../utils/utils.js';

const subs = [
  { key: 'groups.invited', text: 'Someone invites you to join a group' },
  { key: 'groups.joinRequested', text: 'Someone requests to join a group that you manage' },
  { key: 'groups.joined', text: 'Someone joins a group that you manage' },
  { key: 'messages.replied', text: 'Someone replies to one of your messages'},
  { key: 'projects.commented', text: 'Someone comments on one of your projects'},
];

function NotificationSettings() {
  const dispatch = useDispatch();
  const { user, groups } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    return { user, groups };
  });

  const hasEmailSub = (key) => utils.hasSubscription(user, key);
  const toggleEmailSub = (key, enable) => {
    if (enable)
      api.users.createEmailSubscription(user.username, key, ({ subscriptions }) => dispatch(actions.users.updateSubscriptions(user._id, subscriptions)), err => toast.error(err.message));
    else
      api.users.deleteEmailSubscription(user.username, key, ({ subscriptions }) => dispatch(actions.users.updateSubscriptions(user._id, subscriptions)), err => toast.error(err.message));
  };

  return (
    <Segment raised color="blue">
      <h3>Email preferences</h3>
      <p>Customise which automated emails you'd like to receive from {utils.appName()}.</p>
      <Divider hidden />

      <Table fluid basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Notification type</Table.HeaderCell>
            <Table.HeaderCell collapsing>Enabled</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell><Label color='orange' size='small'>Required</Label> Important account emails<br /><small>For example, password-resets, email address change warnings, and so on.</small>

            </Table.Cell>
            <Table.Cell><Checkbox toggle disabled checked={true}/></Table.Cell>
          </Table.Row>
          {subs.map(s =>
            <Table.Row key={s.key}>
              <Table.Cell>{s.text}</Table.Cell>
              <Table.Cell><Checkbox toggle onChange={(e, c) => toggleEmailSub(s.key, c.checked)} checked={hasEmailSub(s.key)}/></Table.Cell>
            </Table.Row>
          )}
          {groups.map(g =>
            <Table.Row key={g._id}>
              <Table.Cell>Someone writes in the Notice Board of {g.name}</Table.Cell>
              <Table.Cell><Checkbox toggle onChange={(e, c) => toggleEmailSub(`groupFeed-${g._id}`, c.checked)} checked={hasEmailSub(`groupFeed-${g._id}`)}/></Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Segment>
  );
}

export default NotificationSettings;
