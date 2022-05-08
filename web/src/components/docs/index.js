import React from 'react';
import { Container, Divider, Grid, Card, Message, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function Docs() {
  return (
    <Container style={{marginTop: 40}}>
      <h1>Treadl documentation</h1>
      <Divider section />

      <Grid stackable>

        <Grid.Column width={4}>
          <h3>Learning resources</h3>
          <Card as={Link} to='/docs/projects' header='Projects'
            description='Learn about how to create, manage, and organise your projects.'
          />
          <Card as={Link} to='/docs/patterns' header='Pattern editor'
            description='Learn how to use the Treadl pattern editor.'
          />
          <Card as={Link} to='/docs/groups' header='Groups'
            description='Learn more about Treadl groups, and how they can be managed.'
          />
          <Message style={{marginTop: 20}} size='small' info header='Want to contribute documentation?'
            content={<p>That's great! Please reach out to us by emailing <a href='mailto:hello@treadl.com'>hello@treadl.com</a>.</p>}
          />

          <Button style={{position: 'fixed', bottom: 40}} onClick={() => window.scrollTo(0, 0)} secondary><Icon name='arrow up' /> Back to the top</Button>
        </Grid.Column>

        <Grid.Column width={12}>
          <Outlet />
        </Grid.Column>
      </Grid>
    </Container>
  );
};
export default Docs;