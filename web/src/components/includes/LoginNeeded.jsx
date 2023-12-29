import React from 'react';
import { Container, Segment, Button, Message } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';

import utils from '../../utils/utils.js';
import actions from '../../actions';

export default function LoginNeeded() {
  const dispatch = useDispatch();
  
  return (
    <Container style={{marginTop: 30}}>
      <Message info>
        <h3>Welcome to {utils.appName()}</h3>
        <p>You need to have a {utils.appName()} account in order to access this. Please login or register first.</p>
        
        <Button.Group style={{marginTop: 30}}>
          <Button color="white" onClick={() => dispatch(actions.auth.openLogin())}>Login</Button>
          <Button color="teal" onClick={() => dispatch(actions.auth.openRegister())}>Register</Button>
        </Button.Group>
      </Message>
    </Container>
  );
}