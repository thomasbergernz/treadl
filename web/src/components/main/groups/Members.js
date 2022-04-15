import React, { useState, useEffect, useRef } from 'react';
import { Grid, Table, Button, Input, Label, Header, Loader, Segment, Dropdown, Card } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import UserChip from 'components/includes/UserChip';
import HelpLink from 'components/includes/HelpLink';
import UserSearch from 'components/includes/UserSearch';

function Members({ user, group, members, requests, loading, onReceiveUser, onJoinGroup, onLeaveGroup, onUpdateGroupLoading, onDismissInvitation }) {
  const [invitations, setInvitations] = useState([]);
  const joinLinkRef = useRef(null);

  useEffect(() => {
    if (utils.isGroupAdmin(user, group)) {
      api.groups.getInvitations(group._id, setInvitations);
    }
  }, [user, group]);
  useEffect(() => {
    onUpdateGroupLoading(true);
    api.groups.getMembers(group._id, members => {
      members.forEach(onReceiveUser);
      onUpdateGroupLoading(false);
    }, err => {
      toast.error(err.message);
      onUpdateGroupLoading(false);
    });
  }, [group, onReceiveUser, onUpdateGroupLoading]);

  const copyLink = () => {
    joinLinkRef.current.select();
    document.execCommand('Copy');
    toast.info('Link copied to clipboard');
  }
  const kickUser = (id) => {
    utils.confirm('Really kick this user?').then(() => {
      api.groups.deleteMember(group._id, id, () => {
        onLeaveGroup(id, group._id);         
      }, err => toast.error(err.message));
    }, () => {});
  }
  const sendInvitation = (user) => {
    api.groups.createInvitation(group._id, user._id, invitation => {
      const newInvitations = Object.assign([], invitations);
      newInvitations.splice(0, 0, Object.assign({}, invitation, { recipientUser: user }));
      setInvitations(newInvitations);
      toast.info('Invitation sent');
    }, err => toast.error(err.message));
  }
  const deleteInvitation = (invite) => {
    api.groups.deleteInvitation(group._id, invite._id, () => {
      const newInvitations = Object.assign([], invitations).filter(i => i._id !== invite._id);
      setInvitations(newInvitations);
    }, err => toast.error(err.message));
  }
  const approveRequest = (invite) => {
    api.invitations.accept(invite._id, (result) => {
      onDismissInvitation(invite._id);
      onReceiveUser(invite.invitedBy);
      onJoinGroup(invite.user, group._id);
      toast.success(`${invite.invitedBy.username} is now a member`);
    }, err => toast.error(err.message));
  }
  const declineRequest = (request) => {
    api.invitations.decline(request._id, () => onDismissInvitation(request._id),
      err => toast.error(err.message));
  }

  return (
    <div>
      {loading && (!members || !members.length) && <Loader active inline="centered" />}
      {!loading && utils.isGroupAdmin(user, group) && 
        <Segment raised color='blue' style={{marginBottom: 30}}>
          {(members && members.length === 1 && members[0]._id === user._id) ?
            <Header>You're the only person in this group</Header>
          :
            <Header>Add people to your group</Header>
          }
          <Grid stackable columns={2}>
            <Grid.Column>
              <p>Share this link with others that you'd like to join your group. You can also send this link to people who don't already have a Treadl account.</p>
              <HelpLink link='https://git.wilw.dev/seastorm/treadl/wiki/Groups#discovering-your-group' text='Get help with discovery' marginBottom/>
              <Input ref={joinLinkRef} fluid readOnly value={utils.absoluteUrl(`/groups/${group._id}`)}
                action=<Button color='teal' icon='copy' onClick={copyLink}/>  
              />
            </Grid.Column>
            <Grid.Column>
              <p>If you know someone who already has a Treadl account you can search for their username and we'll send them an invitation to join your group.</p>
              <HelpLink link='https://git.wilw.dev/seastorm/treadl/wiki/Groups#inviting-others-to-your-group' text='Get help with invites' marginBottom/>
              <UserSearch fluid onSelected={sendInvitation}/>
            </Grid.Column>
          </Grid>
        </Segment>
      }

      {requests?.length > 0 &&
        <Segment raised color='green' style={{marginBottom:30}}>
          <h3>You have membership requests</h3>
          <p>The following users want to join {group.name}.</p>
          <Table relaxed='very' basic='very'>
            <Table.Body>
              {requests.map(r =>
                <Table.Row key={r._id} verticalAlign='middle'>
                  <Table.Cell collapsing><UserChip user={r.invitedBy} /></Table.Cell>
                  <Table.Cell>{moment(r.createdAt).fromNow()}</Table.Cell>
                  <Table.Cell collapsing>
                    <Button color='green' content='Approve' onClick={e => approveRequest(r)}/>
                    <Button basic content='Decline' onClick={e => declineRequest(r)}/>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Segment>
      }
      
      <Card.Group itemsPerRow={3} doubling stackable>
        {invitations && invitations.map(i => 
          <Card key={i._id}>
            <Card.Content>
              <UserChip user={i.recipientUser} />
            </Card.Content>
            <Card.Content extra >
              <Label size='tiny' color='yellow' content='Invited' />
              {utils.isGroupAdmin(user, group) &&
                <Dropdown text='Options' style={{float:'right'}}>
                  <Dropdown.Menu>
                    <Dropdown.Item icon='trash' content='Delete invitation' onClick={e => deleteInvitation(i)} />
                  </Dropdown.Menu>
                </Dropdown>
              }
            </Card.Content>
          </Card>
        )}
        {members && members.map(m => 
          <Card key={m._id}>
            <Card.Content>
              <UserChip user={m} />
              <Card.Meta style={{marginTop: 10}}>{m.bio}</Card.Meta>
            </Card.Content>
            <Card.Content extra >
              {utils.isGroupAdmin(m, group) &&
                <Label size='tiny' color='violet' icon='rocket' content='Admin' />
              }
              {utils.isGroupAdmin(user, group) && user._id !== m._id &&
                <Dropdown text='Options' style={{float:'right'}}>
                  <Dropdown.Menu>
                    <Dropdown.Item icon='ban' content='Kick' onClick={e => kickUser(m._id)} />
                  </Dropdown.Menu>
                </Dropdown>
              }
            </Card.Content>
          </Card>
        )}
      </Card.Group>

      
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.match.params;
  const group = state.groups.groups.filter(g => g._id === id)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const members = state.users.users.filter(u => utils.isInGroup(u, id));
  const requests = state.invitations.invitations.filter(i => i.recipientGroup === group?._id);
  return { user, group, members, loading: state.groups.loading, errorMessage: state.groups.errorMessage, requests };
};
const mapDispatchToProps = dispatch => ({
  onDismissInvitation: id => dispatch(actions.invitations.dismiss(id)),
  onReceiveUser: user => dispatch(actions.users.receive(user)),
  onJoinGroup: (userId, groupId) => dispatch(actions.users.joinGroup(userId, groupId)),
  onLeaveGroup: (userId, groupId) => dispatch(actions.users.leaveGroup(userId, groupId)),
  onUpdateGroupLoading: l => dispatch(actions.users.request(l)),
});
const MembersContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(Members));

export default MembersContainer;
