import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Modal, Menu, Button, Container, Dropdown, Popup, Icon, List } from 'semantic-ui-react';
import api from '../../api';
import actions from '../../actions';
import utils from '../../utils/utils.js';

import logo from '../../images/logo/main.png';
import UserChip from './UserChip';
import SupporterBadge from './SupporterBadge';
import SearchBar from './SearchBar';

const StyledNavBar = styled.div`
  height:60px;
  background: linen;
  padding: 5px 0px;
  .logo{
    height:40px;
    margin-top:5px;
    margin-right: 50px;
    transition: opacity 0.3s;
    &:hover{
      opacity: 0.5;
    }
  }
  .only-mobile{
    @media only screen and (min-width: 768px) {
      display:none;
    }
  }
  .above-mobile{
    @media only screen and (max-width: 767px) {
      display:none !important;
    }
  }
`;

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, groups, helpModalOpen } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    const { isAuthenticated } = state.auth;
    const { helpModalOpen } = state.app;
    return { isAuthenticated, user, groups, helpModalOpen };
  });

  const logout = () => api.auth.logout(() => {
    dispatch(actions.auth.logout());
    dispatch(actions.users.syncDrift(false))
    if (window.drift) window.drift.reset();
    navigate('/');
  });
  const isSupporter = user?.isSilverSupporter || user?.isGoldSupporter;

  return (
    <StyledNavBar>
      <Container style={{display:'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link to="/"><img alt={`${utils.appName()} logo`} src={logo} className="logo" /></Link>
          <div style={{flex: 1}}>
            <Menu secondary>
              <Menu.Item className='above-mobile' as={Link} to='/' name='home' active={location.pathname === '/'} />
              <Menu.Item className='above-mobile' as={Link} to='/explore' name='explore' active={location.pathname === '/explore'} />
              <Menu.Item className='above-mobile' active={location.pathname.startsWith('/groups')} name='Groups'>
                <Dropdown pointing='top left'
                  trigger={<span>Groups</span>}
                >
                  <Dropdown.Menu>
                    <Dropdown.Header icon='users' content='Your groups' />
                    {groups.map(g =>
                      <Dropdown.Item key={g._id} as={Link} to={`/groups/${g._id}`} content={g.name} />
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to='/groups/new' icon='plus' content='Create a new group' />
                  </Dropdown.Menu>
                </Dropdown>
              </Menu.Item>
              {user && !isSupporter && (import.meta.env.VITE_PATREON_URL || import.meta.env.VITE_KOFI_URL) &&
                <Menu.Item className='above-mobile'>
                  <Popup pointing='top left' on='hover' hoverable
                    trigger={<div style={{padding: 5, background: 'rgba(0,0,0,0.05)', borderRadius: 5}}><span role='img' aria-label='Celebrate' style={{marginRight: 5}}>🙌</span> Help {utils.appName()}</div>}
                    content={
                      <div>
                        <h3><Icon name='trophy' />Support {utils.appName()}</h3>
                        <p>{utils.appName()} is offered free of charge, but costs money to run and build. If you get value out of {utils.appName()} you may like to consider supporting it.</p>
                        <List relaxed='very'>
                          {import.meta.env.VITE_KOFI_URL &&
                            <List.Item as='a' href={import.meta.env.VITE_KOFI_URL} target='_blank' rel='noopener noreferrer' className='umami--click--kofi-button'>
                              <List.Icon name='coffee' size='large' verticalAlign='middle' />
                              <List.Content>
                                <List.Header as='a'>Buy us a coffee</List.Header>
                                <List.Description as='a'>One-off  or monthly support</List.Description>
                              </List.Content>
                            </List.Item>
                          }
                          {import.meta.env.VITE_PATREON_URL &&
                            <List.Item as='a' href={import.meta.env.VITE_PATREON_URL} target='_blank' rel='noopener noreferrer' className='umami--click--patreon-button'>
                              <List.Icon name='patreon' size='large' verticalAlign='middle' />
                              <List.Content>
                                <List.Header as='a'>Join us on Patreon</List.Header>
                                <List.Description as='a'>You can get a special badge on your profile</List.Description>
                              </List.Content>
                            </List.Item>
                          }
                        </List>
                      </div>
                    }
                  />
                </Menu.Item>
              }
              
              <Menu.Menu position='right'>
                {isAuthenticated && <>
                  <Menu.Item className='above-mobile'><SearchBar /></Menu.Item>
                  <Dropdown direction="left" pointing="top right" icon={null} style={{ marginTop: 10}}
                    trigger={<UserChip user={user} withoutLink avatarOnly />}
                    >
                    <Dropdown.Menu style={{ minWidth: '200px', paddingTop: 10 }}>
                      {user &&
                        <Dropdown.Header as={Link} to={`/${user.username}`}>
                          <UserChip user={user} />
                        </Dropdown.Header>
                      }
                      {user?.isGoldSupporter && <Dropdown.Header><SupporterBadge type='gold' /></Dropdown.Header>}
                      {user?.isSilverSupporter && !user?.isGoldSupporter && <Dropdown.Header><SupporterBadge type='silver' /></Dropdown.Header>}
                      <Dropdown.Divider />
                      <Link to="/" className="item">Projects</Link>
                      {user &&<Link to={`/${user.username}`} className="item">Profile</Link>}
                      <Link to="/settings" className="item">Settings</Link>
                      <Dropdown.Divider />
                      {user?.roles?.indexOf('root') > -1 &&
                        <Dropdown.Item as={Link} to='/root'>Root</Dropdown.Item>
                      }
                      <Dropdown.Item as={Link} to='/docs'>Help</Dropdown.Item>
                      <Dropdown.Item onClick={e => dispatch(actions.app.openHelpModal(true))}>About {utils.appName()}</Dropdown.Item>
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>}
                
                {!isAuthenticated && <>
                  <Menu.Item name='Login' onClick={() => dispatch(actions.auth.openLogin())} />
                  <Menu.Item>
                    <Button size='small' color="teal" onClick={() => dispatch(actions.auth.openRegister())}>
                      <span role="img" aria-label="wave">👋</span> Sign-up
                    </Button>
                  </Menu.Item>
                </>}
              </Menu.Menu>
            </Menu>
          </div>
        </Container>
        <AboutModal open={helpModalOpen} onClose={e => dispatch(actions.app.openHelpModal(false))} />
      </StyledNavBar>
    );
  }
  
  function AboutModal({ open, onClose }) {
    return (
      <Modal open={open} onClose={e => onClose()}>
        <Modal.Header>Welcome to {utils.appName()}!</Modal.Header>
        <Modal.Content>
          <h3>Introduction</h3>
          <p>{utils.appName()} has been designed as a resource for weavers – not only for those working alone as individuals, but also for groups who wish to share ideas, design inspirations and weaving patterns. It is ideal for those looking for a depository to store their individual work, and also for groups such as guilds, teaching groups, or any other collaborative working partnerships.</p>
          <p>Projects can be created within {utils.appName()} using the integral WIF-compatible draft editor, or alternatively files can be imported from other design software along with supporting images and other information you may wish to be saved within the project file. Once complete, projects may be stored privately, shared within a closed group, or made public for other {utils.appName()} users to see. The choice is yours!</p>

          <h3>Getting started</h3>
          <p><strong>Creating a profile:</strong> You can add a picture, links to a personal website, and other social media accounts to tell others more about yourself.</p>
          <p><strong>Creating a group:</strong> You have the option to do things alone, or create a group. By clicking on the ‘Create a group’ button, you can name your group, and then invite members via email or directly through {utils.appName()} if they are existing {utils.appName()} users.</p>
          <p><strong>Creating a new project:</strong> When you are ready to create/store a project on the system, you are invited to give the project a name, and a brief description. You will then be taken to a ‘Welcome to your project’ screen, where if you click on ‘add something’, you have the option of creating a new weaving pattern directly inside {utils.appName()} or you can simply import a WIF file from your preferred weaving software. Once imported, you can perform further editing within {utils.appName()}, or you can add supporting picture files and any other additional information you wish to keep (eg weaving notes, yarn details etc).</p>
          <p>Once complete you then have the option of saving the file privately, shared within a group, or made public for other {utils.appName()} users to see.</p>

          <h3>Help and support</h3>
          <p>The documentation provides useful information that might help you if you get stuck.</p>
          <Button as='a' href='/docs' target='_blank' rel='noopener noreferrer'>View the docs</Button>

          <h3>We hope you enjoy using {utils.appName()}</h3>
          <p>If you have any comments or feedback please tell us by emailing <a href={`mailTo:${import.meta.env.VITE_CONTACT_EMAIL}`}>{import.meta.env.VITE_CONTACT_EMAIL}</a>!</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={e => onClose()} color='teal' icon='check' content='OK' />
        </Modal.Actions>
      </Modal>
    );
  }