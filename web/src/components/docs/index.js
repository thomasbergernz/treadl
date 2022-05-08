import React from 'react';
import { Container, Divider, Grid, Card, Message, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import utils from 'utils/utils.js';

function Docs() {
  return (
    <Container style={{marginTop: 40}}>
      <h1>{utils.appName()} documentation</h1>
      <Divider section />

      <Grid stackable>

        <Grid.Column width={4}>
          <h3>Learning resources</h3>
          <Card as={Link} to='/docs/projects' header='Projects'
            description='Learn about how to create, manage, and organise your projects.'
          />
          <Card as={Link} to='/docs/patterns' header='Pattern editor'
            description={`Learn how to use the ${utils.appName()} pattern editor.`}
          />
          <Card as={Link} to='/docs/groups' header='Groups'
            description={`Learn more about ${utils.appName()} groups, and how they can be managed.`}
          />
          <Message style={{marginTop: 20}} size='small' info header='Want to contribute documentation?'
            content={<p>That's great! Please reach out to us by emailing <a href={`mailTo:${process.env.REACT_APP_CONTACT_EMAIL}`}>{process.env.REACT_APP_CONTACT_EMAIL}</a>.</p>}
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