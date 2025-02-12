import React, { useState } from 'react';
import {
  Message, Modal, Grid, Form, Input, Button,
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import actions from '../actions';
import { api } from '../api';
import utils from '../utils/utils.js';

import ReadingImage from '../images/reading.png';

function Login({ open, authType, onClose }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { error } = useSelector(state => {
    const { loading, error } = state.auth;
    return { loading, error };
  });

  const login = () => {
    setLoading(true);
    api.auth.login(email, password, () => dispatch(actions.auth.requestLogin()), (data) => {
      setLoading(false);
      setPassword('');
      setEmail('');
      setUsername('');
      dispatch(actions.auth.receiveLogin(data));
      onClose();
      if (location.pathname === '/') navigate('/projects');
    }, (err) => {
      dispatch(actions.auth.loginError(err));
      setLoading(false);
    });
  };

  const register = () => {
    setLoading(true);
    api.auth.register(username, email, password, () => dispatch(actions.auth.requestLogin()), (data) => {
      setLoading(false);
      setPassword('');
      setEmail('');
      setUsername('');
      dispatch(actions.auth.receiveLogin(data));
      onClose();
      if (location.pathname === '/') navigate('/projects');
    }, (err) => {
      dispatch(actions.auth.loginError(err));
      setLoading(false);
    });
  };

  return (
    <div>
      {authType === 'register'
        && (
        <Modal dimmer="inverted" open={open} onClose={onClose}>
          <Modal.Header>
            <span role="img" aria-label="wave">👋</span> Welcome!
            <Button floated="right" onClick={onClose} basic content="Close" />
          </Modal.Header>
          <Modal.Content>
            <Grid stackable>
              <Grid.Column computer={8}>
                <h4>Create a free account</h4>
                <p>Having your own account lets you create and manage your own projects and patterns.</p>
                <p>
                  <span role="img" aria-label="diamond">💎</span> It's free
                </p>
                <p>
                  <span role="img" aria-label="running person">🏃</span> Quick &amp; easy
                </p>
                <p>
                  <span role="img" aria-label="hug">🤗</span> Friendly interface
                </p>
                <p>
                  <span role="img" aria-label="pencil">✏️ </span> In-built pattern-editor
                </p>
                <p>
                  <span role="img" aria-label="laptop">💻</span> Compatible with other software (using the WIF format)
                </p>
                <p>
                  <span role="img" aria-label="folder">📁</span> Add weaving patterns, images, and other files to your projects
                </p>
                <p>
                  <span role="img" aria-label="family">👨‍👩‍👧‍👦</span> Join a growing community of weavers and makers
                </p>
                <p>
                  <span role="img" aria-label="map">🗺️</span> Contribute to the roadmap as we develop
                </p>
                <p>
                  <span role="img" aria-label="padlock">🔒</span> Secure and robust
                </p>
              </Grid.Column>
              <Grid.Column computer={8}>
                <Message>
                  <strong>
                    <span role="img" aria-label="wip">🚧</span> We're always building!
                  </strong> Sign-up to see what it's about, and we'd love to hear your feedback and work with you as we grow.
                </Message>

                {error && (<div className="ui warning message">{error.message}</div>)}
                <Form onSubmit={register}>
                  <Form.Field>
                    <label>Pick a username
                      <small> (you can use letters, numbers and underscores)</small>
                    </label>
                    <Input autoFocus size="large" fluid name="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                  </Form.Field>
                  <Form.Field>
                    <label>Email address
                      <small> (for password resets &amp; other important things)</small>
                    </label>
                    <Input size="large" fluid name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </Form.Field>
                  <Form.Field>
                    <label>Choose a strong password
                      <small> (at least 6 characters)</small>
                    </label>
                    <Input size="large" fluid name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  </Form.Field>
                  <div className="ui hidden divider" />
                  <p style={{ fontSize: 11, color: 'rgb(180,180,180)' }}>By signing-up, you agree to the {utils.appName()} <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="terms-of-use" target="_blank">Terms of Use</a>.</p>
                  <Form.Button color="teal" type='submit' fluid size="large" loading={loading}>
                    <span role="img" aria-label="rocket">🚀</span> Sign up!
                  </Form.Button>
                </Form>
              </Grid.Column>
            </Grid>
          </Modal.Content>
        </Modal>
        )
      }
      {authType === 'login'
        && (
        <Modal dimmer="inverted" open={open} onClose={onClose}>
          <Modal.Header>
            <span role="img" aria-label="Peace">✌️ </span>
Welcome back <Button floated="right" onClick={onClose} basic content="Close" />
          </Modal.Header>
          <Modal.Content>
            <Grid stackable>
              <Grid.Column computer={8}>
                <h4>Login to your account to manage your projects.</h4>
                <img alt='Reading' src={ReadingImage} style={{maxWidth:'95%', margin: '20px auto'}} />
              </Grid.Column>

              <Grid.Column computer={8}>
                {error && (<div className="ui warning message">{error.message}</div>)}
                <Form onSubmit={login}>
                  <Form.Field>
                    <label>Your email address or username</label>
                    <Input autoFocus size="large" fluid name="email" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='Email or username' />
                  </Form.Field>
                  <Form.Field>
                    <label>Password</label>
                    <Input size="large" fluid name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' />
                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                      <Link to="/password/forgotten" onClick={onClose}>Forgotten your password?</Link>
                    </div>
                  </Form.Field>
                  <div className="ui hidden divider" />
                  <Form.Button type='submit' size="large" color="teal" fluid loading={loading}>Login</Form.Button>
                </Form>
              </Grid.Column>
            </Grid>
          </Modal.Content>
        </Modal>
        )
      }
    </div>
  );
}

export default Login;
