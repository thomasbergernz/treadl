import React from 'react';
import { Divider, Container, Grid, Menu, Message } from 'semantic-ui-react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Settings() {
  
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });
  
  if (!user) return;
  
  return (
    <Container style={{ marginTop: '40px' }}>
      <h2>Manage your account</h2>
      <Divider hidden />
      <Grid stackable>
        <Grid.Column computer={4}>
          <Message size='tiny'>You can change your profile information on your <Link to={`/${user.username}/edit`}>Profile page.</Link></Message>
          <Menu fluid vertical tabular>
            <Menu.Item as={NavLink} to="/settings/identity" name="identity" icon="user secret" />
            <Menu.Item as={NavLink} to='/settings/notifications' content='Notifications' icon='envelope' />
            <Menu.Item as={NavLink} to="/settings/account" name="Account" icon="key" />
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={12}>
          <Outlet />
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default Settings;
