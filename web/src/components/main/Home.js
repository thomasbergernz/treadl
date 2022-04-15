import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, Divider, Button, Message, Container, Segment, Grid, Card, Icon, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import actions from 'actions';
import api from 'api';
import utils from 'utils/utils.js';

import UserChip from 'components/includes/UserChip';
import HelpLink from 'components/includes/HelpLink';
import ProjectCard from 'components/includes/ProjectCard';

function Home({ user, groups, projects, invitations, loadingProjects, onReceiveProjects, onReceiveInvitations, onDismissInvitation, onReceiveGroup, onJoinGroup }) {

  useEffect(() => {
    api.invitations.get(({ invitations, sentInvitations}) => {
      onReceiveInvitations(invitations.concat(sentInvitations));
    });
  }, [onReceiveInvitations]);
  useEffect(() => {
    api.users.getMyProjects(onReceiveProjects);
  }, [onReceiveProjects]);

  const declineInvite = (invite) => {
    api.invitations.decline(invite._id, () => onDismissInvitation(invite._id), err => toast.error(err.message));
  }
  const acceptInvite = (invite) => {
    api.invitations.accept(invite._id, (result) => {
      onDismissInvitation(invite._id);
      if (result.group) {
        onReceiveGroup(result.group);
        onJoinGroup(user._id, result.group._id);
      }
    }, err => toast.error(err.message));
  }

  let greeting = 'Welcome';
  const hours = (new Date()).getHours();
  if (hours < 4) greeting = 'You\'re up late';
  if (hours >= 4 && hours < 12) greeting = 'Good morning';
  if (hours >=12 && hours < 17) greeting = 'Good afternoon';
  if (hours >= 17) greeting = 'Good evening';

  return (
    <Container style={{ marginTop: '40px' }}>
      <Helmet title='Dashboard' />
      <Grid stackable>
        <Grid.Column computer={5}>

          {invitations && invitations.length > 0 && invitations.map(i =>
            <Card key={i._id} color='green' fluid>
              <Card.Content>
                <UserChip user={i.invitedBy} />
                <div style={{marginTop: 5}} />
                {i.type === 'group' &&
                  <p>{i.invitedBy.username} has invited you to join the group <Link to={`/groups/${i.typeId}`}>{i.group && i.group.name}</Link>.</p>
                }
                {i.type === 'groupJoinRequest' &&
                  <p>{i.invitedBy.username} is requesting to join the group <Link to={`/groups/${i.typeId}`}>{i.group?.name}</Link>.</p>
                }
              </Card.Content>
              <Card.Content>
                <Button.Group fluid>
                  <Button color='green' content='Accept' onClick={e => acceptInvite(i)} />
                  <Button basic content='Decline' onClick={e => declineInvite(i)} />
                </Button.Group>
              </Card.Content>
            </Card>
          )}

          <h2><span role="img" aria-label="wave">👋</span> {greeting}{user && <span>, {user.username}</span>}</h2>

          <Card fluid color='blue'>
            <Card.Content>
              <Card.Header><span role="img" aria-label="Loudspeaker">📣</span> Treadl is open-source</Card.Header>
              <Card.Description>The source code for Treadl is <a href='https://git.wilw.dev/seastorm/treadl' target='_blank' rel='noopener noreferrer'>publicly available to view</a> and use in your own projects. Contributions are encouraged too!</Card.Description>
            </Card.Content>
          </Card>

          <Card fluid color='blue'>
            <Card.Content>
              <Card.Header><span role="img" aria-label="Dancer">🕺</span> Support Treadl</Card.Header>
              <Card.Description>Treadl is offered free of charge, but costs money to run and build. If you get value out of Treadl and want to support its ongoing development, then you can  become a patron!</Card.Description>
              <Button style={{marginTop: 10}} size='small' as='a' href='https://www.patreon.com/treadl' target='_blank' rel='noopener noreferrer'><span role='img' aria-label='Party' style={{marginRight: 5}}>🥳</span> Become a patron</Button>
            </Card.Content>
          </Card>

          {(groups && groups.length) ?
            <Card fluid>
              <Card.Content>
                <Card.Header>Your groups</Card.Header>

                <List relaxed>
                  {groups.map(g =>
                    <List.Item key={g._id}>
                      <List.Icon name='users' size='large' verticalAlign='middle' />
                      <List.Content>
                        <List.Header as={Link} to={`/groups/${g._id}`}>{g.name}</List.Header>
                        <List.Description>{utils.isGroupAdmin(user, g) ? 'Administrator' : 'Member'}</List.Description>
                      </List.Content>
                    </List.Item>
                  )}
                </List>
                <Button fluid size='small' icon='plus' content='Create a new group' as={Link} to='/groups/new' />
                <HelpLink link='https://git.wilw.dev/seastorm/treadl/wiki/Groups' text='Learn more about groups' marginTop/>
              </Card.Content>
            </Card>
          :
            <Message>
              <Message.Header>Groups</Message.Header>
              <p>Groups enable you to build communities of weavers and makers with similar interests. Create one for your weaving group or class today.</p>
              <Button as={Link} to='/groups/new' size='small' color='purple' icon='plus' content='Create a group' />
            </Message>
          }

        </Grid.Column>

        <Grid.Column computer={11}>
          {loadingProjects && !projects.length &&
            <div style={{textAlign: 'center'}}>
              <h4>Loading your projects...</h4>
              <Loader active inline="centered" />
            </div>
          }

          {user && !loadingProjects && (!projects || !projects.length) &&
            <div style={{textAlign: 'center'}}>
              <h1>
                <span role="img" aria-label="chequered flag">🚀</span> Let's get started, {user?.username}!
              </h1>
              <Divider hidden/>
              <Segment placeholder textAlign='center'>
                <h3>On Treadl your patterns and files are stored in <strong><span role="img" aria-label="box">📦</span> projects</strong></h3>
                <p>Projects can contain anything - from rough ideas or design experiments through to commissions and exhibitions. Treat them as if they were just weaving-related <span role="img" aria-label="folder">📁</span> folders on your computer.</p>
                <Divider  />
                <h4>Start by creating a new project. Don't worry, you can keep it private.</h4>
                <p><HelpLink link='https://git.wilw.dev/seastorm/treadl/wiki/Projects' text='Learn more about projects' marginTop/></p>
                <Button as={Link} to="/projects/new" color="teal" icon="plus" content="Create a project" />
              </Segment>

            </div>
          }

          {projects && projects.length > 0 &&
            <div>
              <Button as={Link} to="/projects/new" color='teal' content='Create a project' icon='plus' floated='right'/>
              <h2><Icon name='book' /> Your projects</h2>
              <p>Projects contain the patterns and files that make up your creations.
                <HelpLink link='https://git.wilw.dev/seastorm/treadl/wiki/Projects' text='Learn more about projects' marginLeft/>
              </p>
              <Divider clearing hidden />
              <Card.Group itemsPerRow={2} stackable>
                {projects && projects.map(proj => (
                  <ProjectCard key={proj._id} project={proj} />
                ))}
              </Card.Group>
            </div>
          }
        </Grid.Column>
      </Grid>
    </Container>
  );
}

const mapStateToProps = state => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
  const invitations = state.invitations.invitations.filter(i => i.recipient === user?._id);
  const projects = state.projects.projects.filter(p => p.user === user?._id);
  return { user, projects, groups, invitations, loadingProjects: state.projects.loading };
}
const mapDispatchToProps = dispatch => ({
  onReceiveGroup: group => dispatch(actions.groups.receiveGroup(group)),
  onJoinGroup: (userId, groupId) => dispatch(actions.users.joinGroup(userId, groupId)),
  onReceiveProjects: p => dispatch(actions.projects.receiveProjects(p)),
  onDismissInvitation: id => dispatch(actions.invitations.dismiss(id)),
  onReceiveInvitations: i => dispatch(actions.invitations.receiveInvitations(i)),
});
const HomeContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);

export default HomeContainer;
