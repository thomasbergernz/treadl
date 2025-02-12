import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, Divider, Button, Message, Container, Segment, Grid, Card, Icon, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BulletList } from 'react-content-loader'
import { toast } from 'react-toastify';
import actions from '../../actions';
import api from '../../api';
import utils from '../../utils/utils.js';

import LoginNeeded from '../includes/LoginNeeded';
import UserChip from '../includes/UserChip';
import HelpLink from '../includes/HelpLink';
import ProjectCard from '../includes/ProjectCard';
import PatternLoader from '../includes/PatternLoader';
import Tour from '../includes/Tour';
import DiscoverCard from '../includes/DiscoverCard';
import Feed from '../includes/Feed';

function Home() {
  const [runJoyride, setRunJoyride] = useState(false);
  const dispatch = useDispatch();
  const { user, projects, groups, invitations, loadingProjects, loadingGroups } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    const invitations = state.invitations.invitations.filter(i => i.recipient === user?._id);
    const projects = state.projects.projects.filter(p => p.user === user?._id);
    return { user, projects, groups, invitations, loadingProjects: state.projects.loading, loadingGroups: state.groups.loading };
  });

  useEffect(() => {
    api.invitations.get(({ invitations, sentInvitations}) => {
      dispatch(actions.invitations.receiveInvitations(invitations.concat(sentInvitations)));
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

          <Feed />
  
          <Card fluid className='joyride-groups' style={{opacity: 0.8}}>
            <Card.Content>
              <Card.Header>Your groups</Card.Header>

              {(loadingGroups && !groups?.length) ?
                <div>
                  <BulletList />
                  <BulletList />
                </div>
                :
                (groups?.length > 0 ?
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
                :
                  <Card.Description>
                    Groups enable you to join or build communities of weavers and makers with similar interests.
                  </Card.Description>
                )
              }
              <Divider hidden />
              <Button className='joyride-createGroup' fluid size='small' icon='plus' content='Create a new group' as={Link} to='/groups/new' />
              <HelpLink link={`/docs/groups`} text='Learn more about groups' marginTop/>
            </Card.Content>
          </Card>

        </Grid.Column>

        <Grid.Column computer={11} className='joyride-projects'>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2><Icon name='book' /> Your projects</h2>
            {user &&
              <div><Button className='joyride-createProject' as={Link} to="/projects/new" color='teal' content='Create a project' icon='plus' /></div>
            }
          </div>
          <p>Projects contain the patterns and files that make up your creations.
            <HelpLink className='joyride-help' link={`/docs/projects`} text='Learn more about projects' marginLeft/>
          </p>
          
          <Divider hidden />
          
          {!user &&
            <LoginNeeded />
          }
        
          {user && loadingProjects && !projects?.length &&
            <Card.Group itemsPerRow={2} stackable>
              <PatternLoader isCompact count={3} />
            </Card.Group>
          }

          {user && !loadingProjects && !projects?.length &&
            <div style={{textAlign: 'center'}}>
              <Segment placeholder textAlign='center'>
                <h3>On {utils.appName()}, your patterns and files are stored in <strong><span role="img" aria-label="box">📦</span> projects</strong></h3>
                <p>Projects can contain anything: from rough ideas or design experiments through to commissions and exhibitions. Treat them as if they were just <span role="img" aria-label="folder">📁</span> folders on your computer.</p>
                <Divider  section hidden />
                <h4>Start by creating your first project. You can keep it private if you prefer.</h4>
                
                <Button className='joyride-createProject' as={Link} to="/projects/new" color="teal" icon="plus" content="Create a project" />
              </Segment>
            </div>
          }

          {projects?.length > 0 &&
            <div>
              <Card.Group itemsPerRow={2} stackable>
                {projects.map(proj => (
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
