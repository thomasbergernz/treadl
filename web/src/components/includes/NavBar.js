import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Loader, List, Popup, Modal, Grid, Icon, Button, Container, Dropdown } from 'semantic-ui-react';
import api from 'api';
import actions from 'actions';
import utils from 'utils/utils.js';

import logoLight from 'images/logo/light.png';
import UserChip from 'components/includes/UserChip';

const StyledNavBar = styled.div`
  height:60px;
  background-image: linear-gradient(to right, rgb(237,1,118), rgb(221,13,197));
  padding: 5px 0px;
  .logo{
    height:40px;
    margin-top:5px;
  }
  .nav-links{
    vertical-align:middle;
    margin-top:8px;
    .ui.button{
      margin-right: 8px;
    }
  }
  .ui.button.white{
    background:white;
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

const SearchBar = styled.div`
  background-color:rgba(0,0,0,0.1);
  padding-left:5px;
  padding-top: 3px;
  color:white;
  border: none;
  border-radius:5px;
  transition: background-color 0.5s;
  margin-right:8px;
  display:inline-block;
  &:before{
    display:inline-block;
    content: '🔍';
  }
  &:focus-within{
    background-color:rgba(250,250,250,0.5);
    color:rgb(50,50,50);
    input {
      outline: none;
    }
    input::placeholder {
      color:black;
    }
  }
  input{
    border:none;
    background:none;
    padding:8px;
    &::placeholder {
      color:white;
    }
  }
`;

function NavBar({ user, groups, onOpenLogin, onOpenRegister, isAuthenticated, onLogout, onDriftSynced, helpModalOpen, openHelpModal, searchTerm, updateSearchTerm, searchPopupOpen, openSearchPopup, searchResults, updateSearchResults, searching, updateSearching, history }) {
  const navigate = useNavigate();
  useEffect(() => {
    openSearchPopup(false);
  }, [openSearchPopup]);

  const logout = () => api.auth.logout(() => {
    onLogout();
    onDriftSynced(false);
    if (window.drift) window.drift.reset();
    navigate('/');
  });

  const search = () => {
    updateSearching(true);
    api.search.all(searchTerm, updateSearchResults);
  };

  return (
    <StyledNavBar>
      <Container style={{display:'flex', justifyContent: 'space-between'}}>
        <Link to="/"><img alt="Treadl logo" src={logoLight} className="logo" /></Link>
        {isAuthenticated
          ? (
            <div className='nav-links'>
              <Popup basic on='focus' open={searchPopupOpen} onOpen={e => openSearchPopup(true)} onClose={e => openSearchPopup(false)}
                trigger={<SearchBar><input placeholder='Click to search...' value={searchTerm} onChange={e => updateSearchTerm(e.target.value)} onKeyDown={e => e.keyCode === 13 && search()} /></SearchBar>}
                content={<div style={{width: 300}} className='joyride-search'>
                  {!searchResults?.users && !searchResults?.groups ?
                    <small>
                      {searching
                        ? <span><Loader size='tiny' inline active style={{marginRight: 10}}/> Searching...</span>
                        : <span>Type something and press enter to search</span>
                      }
                    </small>
                    : <>
                    {(!searchResults.users?.length && !searchResults?.groups?.length && !searchResults?.projects?.length) ?
                      <span><small>No results found</small></span>
                    :
                    <Grid stackable>
                      {searchResults?.users?.length > 0 &&
                        <Grid.Column width={6}>
                          {searchResults?.users?.map(u =>
                            <div style={{marginBottom: 5}}><UserChip user={u} key={u._id} /></div>
                          )}
                        </Grid.Column>
                      }
                      {(searchResults?.projects.length > 0 || searchResults.groups.length > 0) &&
                        <Grid.Column width={10}>
                          <List>
                            {searchResults?.projects?.map(p =>
                              <List.Item key={p._id}>
                                <List.Icon name='book' size='large' verticalAlign='middle' />
                                <List.Content>
                                  <List.Header as={Link} to={'/' + p.fullName}>{p.name}</List.Header>
                                  <List.Description><UserChip compact user={p.owner} /></List.Description>
                                </List.Content>
                              </List.Item>
                            )}
                            {searchResults?.groups?.map(g =>
                              <List.Item key={g._id}>
                                <List.Icon name='users' size='large' verticalAlign='middle' />
                                <List.Content>
                                  <List.Header as={Link} to={`/groups/${g._id}`}>{g.name}</List.Header>
                                  <List.Description><small>{g.closed ? <span><Icon name='lock' /> Closed group</span> : <span>Open group</span>}</small></List.Description>
                                </List.Content>
                              </List.Item>
                            )}
                          </List>
                        </Grid.Column>
                      }
                    </Grid>
                  }</>}
                </div>} />

              <span className='above-mobile'>
                <Button as={Link} to="/" size="small" className="white" icon='home' content='Home' />
              </span>

              {groups.length > 0 &&
                <span className='above-mobile'>
                <Dropdown icon={null} direction='left' pointing='top right'
                  trigger=<Button size='small' icon='users' className='white' content='Groups'/>
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
                <Button size='small' icon='help' basic inverted onClick={e => openHelpModal(true)}/>
              </span>

              <Dropdown direction="left" pointing="top right" icon={null} style={{marginLeft: 10}}
                trigger={
                  <div style={{
                    display: 'inline-block', width: 33, height: 33, borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center center', backgroundImage: `url(${utils.avatarUrl(user)})`, verticalAlign: 'middle', boxShadow: '0px 5px 10px rgba(0,0,0,0.1)', border: '2px solid white'
                  }} />
                }
                >
                <Dropdown.Menu style={{ minWidth: '200px', paddingTop: 10 }}>
                  {user &&
                    <Dropdown.Header as={Link} to={`/${user.username}`}>
                      <div style={{
                        display: 'inline-block', width: 30, height: 30, borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center center', backgroundImage: `url(${utils.avatarUrl(user)})`, verticalAlign: 'middle', marginRight: 8,
                      }}
                      />
                      <span>{user.username}</span>
                    </Dropdown.Header>
                  }
                  <Dropdown.Divider />
                  <Link to="/" className="item">Projects</Link>
                  {user &&<Link to={`/${user.username}`} className="item">Profile</Link>}
                  <Link to="/settings" className="item">Settings</Link>
                  <Dropdown.Divider />
                  {user?.roles?.indexOf('root') > -1 &&
                    <Dropdown.Item as={Link} to='/root'>Root</Dropdown.Item>
                  }
                  <Dropdown.Item as='a' href={`${process.env.REACT_APP_SUPPORT_ROOT}`} target='_blank' rel='noopener noreferrer'>Help</Dropdown.Item>
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
                  trigger=<Button basic inverted icon="bars" />
                >
                  <Dropdown.Menu direction="left">
                    <Dropdown.Item onClick={onOpenLogin}>Login</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </span>
              <span className="above-mobile">
                <Button inverted basic onClick={onOpenLogin}>Login</Button>
              </span>
              <Button color="teal" onClick={onOpenRegister}>
                <span role="img" aria-label="wave">👋</span> Sign-up
              </Button>
            </div>
          )
        }
        <Modal open={helpModalOpen} onClose={e => openHelpModal(false)}>
          <Modal.Header>Welcome to Treadl!</Modal.Header>
          <Modal.Content>
            <h3>Introduction</h3>
            <p>Treadl has been designed as a resource for weavers – not only for those working alone as individuals, but also for groups who wish to share ideas, design inspirations and weaving patterns. It is ideal for those looking for a depository to store their individual work, and also for groups such as guilds, teaching groups, or any other collaborative working partnerships.</p>
            <p>Projects can be created within Treadl using the integral WIF-compatible draft editor, or alternatively files can be imported from other design software along with supporting images and other information you may wish to be saved within the project file. Once complete, projects may be stored privately, shared within a closed group, or made public for other Treadl users to see. The choice is yours!</p>

            <h3>Getting started</h3>
            <p><strong>Creating a profile:</strong> You can add a picture, links to a personal website, and other social media accounts to tell others more about yourself.</p>
            <p><strong>Creating a group:</strong> You have the option to do things alone, or create a group. By clicking on the ‘Create a group’ button, you can name your group, and then invite members via email or directly through Treadl if they are existing Treadl users.</p>
            <p><strong>Creating a new project:</strong> When you are ready to create/store a project on the system, you are invited to give the project a name, and a brief description. You will then be taken to a ‘Welcome to your project’ screen, where if you click on ‘add something’, you have the option of creating a new weaving pattern directly inside Treadl or you can simply import a WIF file from your preferred weaving software. Once imported, you can perform further editing within Treadl, or you can add supporting picture files and any other additional information you wish to keep (eg weaving notes, yarn details etc).</p>
            <p>Once complete you then have the option of saving the file privately, shared within a group, or made public for other Treadl users to see.</p>

            <h3>Help and support</h3>
            <p>The Treadl Wiki provides useful information that might help you if you get stuck.</p>
            <Button as='a' href={process.env.REACT_APP_SUPPORT_ROOT} target='_blank' rel='noopener noreferrer'>View the Wiki</Button>

            <h3>We hope you enjoy using Treadl</h3>
            <p>If you have any comments or feedback please tell us by emailing <a href="mailto:hello@treadl.com">hello@treadl.com</a>!</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={e => openHelpModal(false)} color='teal' icon='check' content='OK' />
          </Modal.Actions>
        </Modal>
      </Container>
    </StyledNavBar>
  );
}

const mapStateToProps = (state) => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
  const { isAuthenticated } = state.auth;
  const { helpModalOpen, searchPopupOpen, searchTerm, searchResults, searching } = state.app;
  return { isAuthenticated, user, groups, helpModalOpen, searchPopupOpen, searchTerm, searchResults, searching };
};
const mapDispatchToProps = dispatch => ({
  onOpenLogin: () => dispatch(actions.auth.openLogin()),
  onOpenRegister: () => dispatch(actions.auth.openRegister()),
  onLogout: () => dispatch(actions.auth.logout()),
  onReceiveUser: user => dispatch(actions.users.receive(user)),
  onDriftSynced: (s) => dispatch(actions.users.syncDrift(s)),
  openHelpModal: o => dispatch(actions.app.openHelpModal(o)),
  openSearchPopup: o => dispatch(actions.app.openSearchPopup(o)),
  updateSearchTerm: t => dispatch(actions.app.updateSearchTerm(t)),
  updateSearchResults: r => dispatch(actions.app.updateSearchResults(r)),
  updateSearching: s => dispatch(actions.app.updateSearching(s)),
});

const NavBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NavBar);

export default NavBarContainer;
