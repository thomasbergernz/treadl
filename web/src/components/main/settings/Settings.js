import React, { Component } from 'react';
import {
  Divider, Container, Grid, Menu,
} from 'semantic-ui-react';
import { Link, Switch, Route } from 'react-router-dom';

import Identity from './Identity';
import Notification from './Notification';
import Billing from './Billing';
import Account from './Account';

class Settings extends Component {
  render() {
    return (
      <Container style={{ marginTop: '40px' }}>
        <h2>Manage your account</h2>
        <Divider hidden />
        <Grid stackable>
          <Grid.Column computer={4}>
            <Menu fluid vertical tabular>
              <Menu.Item as={Link} to="/settings/identity" name="identity" active={this.props.location.pathname === '/settings/identity' || this.props.location.pathname === '/settings'} icon="user secret" />
              <Menu.Item as={Link} to='/settings/notifications' content='Notifications' icon='envelope' active={this.props.location.pathname === '/settings/notifications'} />
                {/*<Menu.Item as={Link} to="/settings/billing" content="Plan &amp; billing" icon="credit card" active={this.props.location.pathname === '/settings/billing'} />*/}
              <Menu.Item as={Link} to="/settings/account" name="Account" active={this.props.location.pathname === '/settings/account'} icon="key" />
            </Menu>
          </Grid.Column>

          <Grid.Column stretched width={12}>
            <Switch>
              <Route path="/settings/notifications" component={Notification} />
              <Route path="/settings/account" component={Account} />
              <Route path="/settings/billing" component={Billing} />
              <Route path="/settings" component={Identity} />
            </Switch>

          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}

export default Settings;
