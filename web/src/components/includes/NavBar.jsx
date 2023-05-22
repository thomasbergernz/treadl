import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Modal, Grid, Icon, Button, Container, Dropdown } from 'semantic-ui-react';
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
  }
  .nav-links{
    display: flex;
    align-items: center;
    .ui.button{
      margin-right: 8px;
    }
  }
  .only-mobile{
    @media only screen and (min-width: 768px) {
      display:none;
    }
  }
  .above-mobile{
    @media only screen and (max-width: 767px) {
      display:none;
    }
  }
`;

function NavBar() {
  const navigate = useNavigate();
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

  return (
    <StyledNavBar>
      <Container style={{display:'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link to="/"><img alt={`${utils.appName()} logo`} src={logo} className="logo" /></Link>
        {isAuthenticated
          ? (
            <div className='nav-links'>
              <SearchBar />
              <span className='above-mobile'>
                <Button as={Link} to="/" size="small" icon='home' basic content='Home' />
                <Button as={Link} to='/explore' size='small' icon='binoculars' basic content='Explore' />
              </span>

              {groups.length > 0 &&
                <span className='above-mobile'>
                <Dropdown icon={null} direction='left' pointing='top right'
                  trigger={<Button size='small' icon='users' basic content='Groups'/>}
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
                </span>
              }

              <span className='above-mobile'>
                <Button size='small' icon='help' basic onClick={e => dispatch(actions.app.openHelpModal(true))}/>
              </span>

              <Dropdown direction="left" pointing="top right" icon={null} style={{marginLeft: 10, marginTop: 5}}
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
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )
          : (
            <div className='nav-links'>
              <span className="only-mobile">
                <Dropdown
                  icon={null}
                  trigger={<Button basic icon="bars" />}
                >
                  <Dropdown.Menu direction="left">
                    <Dropdown.Item onClick={() => dispatch(actions.auth.openLogin())}>Login</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </span>
              <span className="above-mobile">
                <Button as={Link} to='/explore' size='small' icon='binoculars' basic content='Explore' />
                <Button onClick={() => dispatch(actions.auth.openLogin())}>Login</Button>
              </span>
              <Button color="teal" onClick={() => dispatch(actions.auth.openRegister())}>
                <span role="img" aria-label="wave">👋</span> Sign-up
              </Button>
            </div>
          )
        }
        <Modal open={helpModalOpen} onClose={e => dispatch(actions.app.openHelpModal(false))}>
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
            <Button onClick={e => dispatch(actions.app.openHelpModal(false))} color='teal' icon='check' content='OK' />
          </Modal.Actions>
        </Modal>
      </Container>
    </StyledNavBar>
  );
}

export default NavBar;
