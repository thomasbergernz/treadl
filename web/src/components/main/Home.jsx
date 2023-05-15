import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, Divider, Button, Message, Container, Segment, Grid, Card, Icon, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import actions from '../../actions';
import api from '../../api';
import utils from '../../utils/utils.js';

import UserChip from '../includes/UserChip';
import HelpLink from '../includes/HelpLink';
import ProjectCard from '../includes/ProjectCard';
import Tour from '../includes/Tour';

function Home() {
  const [runJoyride, setRunJoyride] = useState(false);
  const [highlightProjects, setHighlightProjects] = useState([]);
  const [highlightUsers, setHighlightUsers] = useState([]);
  const dispatch = useDispatch();
  const { user, projects, groups, invitations, loadingProjects } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    const invitations = state.invitations.invitations.filter(i => i.recipient === user?._id);
    const projects = state.projects.projects.filter(p => p.user === user?._id);
    return { user, projects, groups, invitations, loadingProjects: state.projects.loading };
  });

  useEffect(() => {
    api.invitations.get(({ invitations, sentInvitations}) => {
      dispatch(actions.invitations.receiveInvitations(invitations.concat(sentInvitations)));
    });
    api.search.discover(({ highlightProjects, highlightUsers }) => {
      setHighlightProjects(highlightProjects);
      setHighlightUsers(highlightUsers);
    });
  }, [dispatch]);
  useEffect(() => {
    api.users.getMyProjects(p => dispatch(actions.projects.receiveProjects(p)));
    setTimeout(() =>
    setRunJoyride(true), 2000);
  }, [dispatch]);

  const declineInvite = (invite) => {
    api.invitations.decline(invite._id, () => dispatch(actions.invitations.dismiss(invite._id)), err => toast.error(err.message));
  }
  const acceptInvite = (invite) => {
    api.invitations.accept(invite._id, (result) => {
      dispatch(actions.invitations.dismiss(invite._id));
      if (result.group) {
        dispatch(actions.groups.receiveGroup(result.group));
        dispatch(actions.users.joinGroup(user._id, result.group._id));
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
      <Tour id='home' run={runJoyride} />

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

          {(highlightProjects?.length > 0 || highlightUsers?.length > 0) &&
            <Card fluid>
              <Card.Content>
                {highlightProjects?.length > 0 && <>
                  <h4>Discover public projects</h4>
                  <List relaxed>
                    {highlightProjects.map(p =>
                      <List.Item key={p._id}>
                        <List.Icon name='book' size='large' verticalAlign='middle' />
                        <List.Content>
                          <List.Header className='umami--click--discover-project' as={Link} to={p.fullName}>{p.name}</List.Header>
                        </List.Content>
                      </List.Item>
                    )}
                  </List>
                </>}

                {highlightUsers?.length > 0 && <>
                  <h4>Find others on {utils.appName()}</h4>
                  <List relaxed>
                    {highlightUsers.map(u =>
                      <List.Item key={u._id}>
                        <List.Content>
                          <UserChip user={u} className='umami--click--discover-user'/>
                        </List.Content>
                      </List.Item>
                    )}
                  </List>
                </>}
              </Card.Content>
            </Card>
          }

          {(groups && groups.length) ?
            <Card fluid className='joyride-groups' style={{opacity: 0.8}}>
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
                <Button className='joyride-createGroup' fluid size='small' icon='plus' content='Create a new group' as={Link} to='/groups/new' />
                <HelpLink link={`/docs/groups`} text='Learn more about groups' marginTop/>
              </Card.Content>
            </Card>
          :
            <Message>
              <Message.Header>Groups</Message.Header>
              <p>Groups enable you to build communities of weavers and makers with similar interests. Create one for your weaving group or class today.</p>
              <Button className='joyride-createGroup' as={Link} to='/groups/new' size='small' color='purple' icon='plus' content='Create a group' />
            </Message>
          }

          {(import.meta.env.VITE_PATREON_URL || import.meta.env.VITE_KOFI_URL) &&
            <Card fluid style={{opacity: 0.8}}>
              <Card.Content>
                <Card.Header><span role="img" aria-label="Dancer">🕺</span> Support {utils.appName()}</Card.Header>
                <Card.Description>{utils.appName()} is offered free of charge, but costs money to run and build. If you get value out of {utils.appName()} you may like to consider supporting it.</Card.Description>
                {import.meta.env.VITE_KOFI_URL &&
                  <Button style={{marginTop: 10}} size='small' fluid as='a' href={import.meta.env.VITE_KOFI_URL} target='_blank' rel='noopener noreferrer' className='umami--click--kofi-button'><span role='img' aria-label='Coffee' style={{marginRight: 5}}>☕️</span> Buy me a coffee</Button>
                }
                {import.meta.env.VITE_PATREON_URL &&
                  <Button style={{marginTop: 10}} size='small' fluid as='a' href={import.meta.env.VITE_PATREON_URL} target='_blank' rel='noopener noreferrer' className='umami--click--patreon-button'><span role='img' aria-label='Party' style={{marginRight: 5}}>🥳</span> Become a patron</Button>
                }
              </Card.Content>
            </Card>
          }

        </Grid.Column>

        <Grid.Column computer={11} className='joyride-projects'>
          {loadingProjects && !projects.length &&
            <div style={{textAlign: 'center'}}>
              <h4>Loading your projects...</h4>
              <Loader active inline="centered" />
            </div>
          }

          {user && !loadingProjects && (!projects || !projects.length) &&
            <div style={{textAlign: 'center'}}>
              <h1>
                <span role="img" aria-label="chequered flag">🚀</span> Let's get started
              </h1>
              <Divider hidden/>
              <Segment placeholder textAlign='center'>
                <h3>On {utils.appName()}, your patterns and files are stored in <strong><span role="img" aria-label="box">📦</span> projects</strong></h3>
                <p>Projects can contain anything: from rough ideas or design experiments through to commissions and exhibitions. Treat them as if they were just <span role="img" aria-label="folder">📁</span> folders on your computer.</p>
                <p><HelpLink className='joyride-help' link={`/docs/projects`} text='Learn more about projects' marginTop/></p>
                <Divider  />
                <h4>Start by creating a new project. Don't worry, you can keep it private.</h4>
                
                <Button className='joyride-createProject' as={Link} to="/projects/new" color="teal" icon="plus" content="Create a project" />
              </Segment>

            </div>
          }

          {projects && projects.length > 0 &&
            <div>
              <Button className='joyride-createProject' as={Link} to="/projects/new" color='teal' content='Create a project' icon='plus' floated='right'/>
              <h2><Icon name='book' /> Your projects</h2>
              <p>Projects contain the patterns and files that make up your creations.
                <HelpLink className='joyride-help' link={`/docs/projects`} text='Learn more about projects' marginLeft/>
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

export default Home;
