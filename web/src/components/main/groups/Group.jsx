import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Segment, Loader, Menu, Message, Container, Button, Icon, Grid, Card } from 'semantic-ui-react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import utils from '../../../utils/utils.js';
import actions from '../../../actions';
import api from '../../../api';

import UserChip from '../../includes/UserChip';
import HelpLink from '../../includes/HelpLink';

function Group() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, group, loading, errorMessage, requests, myRequests, invitations } = useSelector(state => {
    let group;
    state.groups.groups.forEach((g) => {
      if (g._id === id) group = g;
    });
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const requests = state.invitations.invitations.filter(i => i.recipientGroup === group?._id);
    const myRequests = state.invitations.invitations.filter(i => i.recipientGroup === group?._id && i.user === user?._id);
    const invitations = state.invitations.invitations.filter(i => i.recipient === user?._id && i.typeId === group?._id);
    return { user, group, loading: state.groups.loading, errorMessage: state.groups.errorMessage, requests, myRequests, invitations };
  });

  useEffect(() => {
    dispatch(actions.groups.request());
    api.groups.get(id, g => dispatch(actions.groups.receiveGroup(g)), err => dispatch(actions.groups.requestFailed(err)));
  }, [dispatch, id]);

  const join = () => {
    if (!user) return toast.warning('Please login or sign-up first');
    api.groups.createMember(id, user._id, () => {
      dispatch(actions.users.joingGroup(user._id, id));
    }, err => toast.error(err.message));
  }
  const leave = () => {
    utils.confirm('Really leave this group?', 'You may not be able to re-join the group yourself.').then(() => {
      api.groups.deleteMember(id, user._id, () => {
        dispatch(actions.users.leaveGroup(user._id, id));
      }, err => toast.error(err.message));
    }, () => {});
  }
  const toggleEmailSub = (key, enable) => {
    if (enable)
      api.users.createEmailSubscription(user.username, key, ({ subscriptions }) => dispatch(actions.users.updateSubscriptions(user._id, subscriptions)), err => toast.error(err.message));
    else
      api.users.deleteEmailSubscription(user.username, key, ({ subscriptions }) => dispatch(actions.users.updateSubscriptions(user._id, subscriptions)), err => toast.error(err.message));
  }

  const requestToJoin = () => {
    api.groups.createJoinRequest(group._id, invitation => {
      toast.success('Request to join sent');
      dispatch(actions.invitations.receiveInvitations([invitation]));
    }, err => toast.error(err.message));
  }

  const declineInvite = (invite) => {
    api.invitations.decline(invite._id, () => dispatch(actions.invitations.dismiss(invite._id)), err => toast.error(err.message));
  }
  const acceptInvite = (invite) => {
    api.invitations.accept(invite._id, (result) => {
      dispatch(actions.invitations.dismiss(invite._id));
      if (result.group) {
        dispatch(actions.users.joinGroup(user._id, result.group._id));
      }
    }, err => toast.error(err.message));
  }

  const invitation = invitations.filter(i => i.typeId === group?._id)[0];

  return (
    <Container style={{ marginTop: '40px' }}>
      <Helmet title={group?.name || 'Group'} />
      {loading && !group &&
        <div style={{textAlign: 'center'}}>
          <h4>Loading group...</h4>
          <Loader active inline="centered" />
        </div>
      }
      {errorMessage && (
      <Message>
        <p><strong>There was a problem finding this page.</strong></p>
        <p>{errorMessage}</p>
      </Message>
      )}
      {group &&
        <div>
          <h2><Icon name='users' /> {group.name}</h2>
          <Grid stackable>
            <Grid.Column computer={4}>
              <Card fluid color='yellow'>
                {group.description &&
                  <Card.Content>{group.description}</Card.Content>
                }
                {group.closed && <Card.Content><Card.Meta>
                  <h4 style={{marginBottom:2}}><Icon name='user secret' /> This is a closed group</h4>
                  <p>Members can only join if they are approved or invited by an admin.</p>
                  {requests?.length > 0 && utils.isGroupAdmin(user, group) &&
                    <Button as={Link} to={`/groups/${group._id}/members`} size='tiny' fluid color='teal' icon='user plus' content={`Manage join requests`} />
                  }
                  {utils.isGroupAdmin(user, group) && !utils.hasSubscription(user, 'groups.joinRequested') &&
                    <Button as={Link} to='/settings/notifications' icon='envelope' size='tiny' fluid basic content='Email me join requests' />
                  }
                </Card.Meta></Card.Content>}
                <Card.Content>
                  <h3>Admins</h3>
                  {group.adminUsers && group.adminUsers.map(a =>
                    <UserChip user={a} key={a._id}/>
                  )}
                </Card.Content>
                <Card.Content extra>
                  {utils.isInGroup(user, group._id) &&
                    <div>
                      <Button color='yellow' basic size='tiny' fluid icon='check' content='Member' onClick={leave} style={{marginBottom:5}}/>
                      {utils.hasEmailSubscription(user, `groupFeed-${group._id}`) ?
                        <Button color='blue' basic size='tiny' fluid icon='rss' content='Subscribed' onClick={e => toggleEmailSub(`groupFeed-${group._id}`, false)} data-tooltip="We'll send you emails when people post in this group" />
                      :
                        <Button color='blue' size='tiny' fluid icon='rss' content='Subscribe to updates' onClick={e => toggleEmailSub(`groupFeed-${group._id}`, true)}/>
                      }
                    </div>
                  }
                  {!utils.isInGroup(user, group._id) &&
                    (group.closed ?
                      <Button disabled={myRequests?.length > 0} color='yellow' size='tiny' fluid icon='user plus' content='Request to join' onClick={requestToJoin} />
                    :
                      <Button color='yellow' size='tiny' fluid icon='user plus' content='Join group' onClick={join}/>
                    )
                  }
                </Card.Content>
              </Card>

              {utils.isInGroup(user, group._id) &&
                <Menu fluid vertical>
                  <Menu.Item active={utils.activePath('^/groups/[a-zA-Z0-9]+$')} as={Link} to={`/groups/${group._id}`} icon='chat' content='Notice Board' />
                  {utils.isInGroup(user, group._id) &&
                    <Menu.Item active={utils.activePath('members')} as={Link} to={`/groups/${group._id}/members`} icon='user' content='Members' label='3' />
                  }
                  {utils.isInGroup(user, group._id) &&
                    <Menu.Item active={utils.activePath('projects')} as={Link} to={`/groups/${group._id}/projects`} icon='book' content='Projects' />
                  }
                  {utils.isGroupAdmin(user, group) &&
                    <Menu.Item active={utils.activePath('settings')} as={Link} to={`/groups/${group._id}/settings`} icon='settings' content='Settings' />
                  }
                </Menu>
              }

              <HelpLink link={`/docs/groups#a-tour-around-your-new-group`} />

            </Grid.Column>
            <Grid.Column computer={12}>
              <Segment>
              {user ?
                <>
                  {!utils.isInGroup(user, group._id) &&
                    <Segment placeholder textAlign='center'>
                      <h2><span role="img" aria-label='Wave'>👋</span> Welcome to {group?.name}</h2>
                      <p>To see and interact with other members of this group you need to be a member yourself.</p>
                      {invitation &&
                        <Card raised style={{margin:'30px auto'}}>
                          <Card.Content textAlign='left'>
                            <Card.Header><UserChip user={invitation.invitedBy} /></Card.Header>
                            <Card.Meta>Current member</Card.Meta>
                            <Card.Description>
                              {invitation.invitedBy.username} has invited you to join this group
                            </Card.Description>
                          </Card.Content>
                          <Card.Content extra>
                            <Button.Group fluid>
                              <Button color='green' basic onClick={e => acceptInvite(invitation)}>Accept</Button>
                              <Button color='red' basic onClick={e => declineInvite(invitation)}>Decline</Button>
                            </Button.Group>
                          </Card.Content>
                        </Card>
                      }
                    </Segment>
                  }
                  <Outlet />
                </>
              :
                <Message>Please login to view or join this group.</Message>
              }
              </Segment>
            </Grid.Column>
          </Grid>
        </div>
      }
    </Container>
  );
}

export default Group;
