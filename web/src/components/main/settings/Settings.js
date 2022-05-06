import React from 'react';
import { Divider, Container, Grid, Menu } from 'semantic-ui-react';
import { Outlet, NavLink } from 'react-router-dom';

function Settings() {
  return (
    <Container style={{ marginTop: '40px' }}>
      <h2>Manage your account</h2>
      <Divider hidden />
      <Grid stackable>
        <Grid.Column computer={4}>
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
