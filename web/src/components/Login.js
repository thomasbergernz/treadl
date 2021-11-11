import React, { Component } from 'react';
import {
  Message, Modal, Grid, Form, Input, Button,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import actions from 'actions';
import { api } from 'api';

import ReadingImage from 'images/reading.png';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registering: false, username: '', email: '', password: '', loading: false,
    };
  }

  login = () => {
    const { email, password } = this.state;
    this.setState({ loading: true });
    api.auth.login(email, password, this.props.onLoginStart, (data) => {
      this.setState({ loading: false, password: '', email: '', username: '' });
      this.props.onLoginSuccess(data);
      this.props.onClose();
    }, (err) => {
      this.props.onLoginFailure(err);
      this.setState({ loading: false });
    });
  }

  register = () => {
    const { username, email, password } = this.state;
    this.setState({ loading: true });
    api.auth.register(username, email, password, this.props.onLoginStart, (data) => {
      this.setState({ loading: false, password: '', email: '', username: '' });
      this.props.onLoginSuccess(data);
      this.props.onClose();
    }, (err) => {
      this.props.onLoginFailure(err);
      this.setState({ loading: false });
    });
  }

  handleChange = (event) => {
    const update = {};
    update[event.target.name] = event.target.value;
    this.setState(update);
  }

  render() {
    const { loading } = this.state;
    return (
      <div>
        {this.props.authType === 'register'
          && (
          <Modal dimmer="inverted" open={this.props.open} onClose={this.props.onClose}>
            <Modal.Header>
              <span role="img" aria-label="wave">👋</span> Welcome!
              <Button floated="right" onClick={this.props.onClose} basic content="Close" />
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

                  {this.props.error && (<div className="ui warning message">{this.props.error.message}</div>)}
                  <Form onSubmit={this.register}>
                    <Form.Field>
                      <label>Pick a username
                        <small> (you can use letters, numbers and underscores)</small>
                      </label>
                      <Input autoFocus size="large" fluid name="username" type="text" value={this.state.username} onChange={event => this.handleChange(event)} />
                    </Form.Field>
                    <Form.Field>
                      <label>Email address
                        <small> (for password resets &amp; other important things)</small>
                      </label>
                      <Input size="large" fluid name="email" type="email" value={this.state.email} onChange={event => this.handleChange(event)} />
                    </Form.Field>
                    <Form.Field>
                      <label>Choose a strong password
                        <small> (at least 6 characters)</small>
                      </label>
                      <Input size="large" fluid name="password" type="password" value={this.state.password} onChange={event => this.handleChange(event)} />
                    </Form.Field>
                    <div className="ui hidden divider" />
                    <p style={{ fontSize: 11, color: 'rgb(180,180,180)' }}>By signing-up, you agree to the Treadl <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="terms-of-use" target="_blank">Terms of Use</a>.</p>
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
        {this.props.authType === 'login'
          && (
          <Modal dimmer="inverted" open={this.props.open} onClose={this.props.onClose}>
            <Modal.Header>
              <span role="img" aria-label="Peace">✌️ </span>
Welcome back <Button floated="right" onClick={this.props.onClose} basic content="Close" />
            </Modal.Header>
            <Modal.Content>
              <Grid stackable>
                <Grid.Column computer={8}>
                  <h4>Login to your account to manage your projects.</h4>
                  <img alt='Reading' src={ReadingImage} style={{maxWidth:'95%', margin: '20px auto'}} />
                </Grid.Column>

                <Grid.Column computer={8}>
                  {this.props.error && (<div className="ui warning message">{this.props.error.message}</div>)}
                  <Form onSubmit={this.login}>
                    <Form.Field>
                      <label>Your email address or username</label>
                      <Input autoFocus size="large" fluid name="email" type="text" value={this.state.email} onChange={event => this.handleChange(event)} placeholder='Email or username' />
                    </Form.Field>
                    <Form.Field>
                      <label>Password
                        <Link to="/password/forgotten" style={{ float: 'right' }} onClick={this.props.onClose}>Forgotten your password?</Link>
                      </label>
                      <Input size="large" fluid name="password" type="password" value={this.state.password} onChange={event => this.handleChange(event)} placeholder='Password' />
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
}

const mapStateToProps = (state) => {
  const { auth } = state;
  const { loading, isAuthenticated, error } = auth;
  return { loading, isAuthenticated, error };
};
const mapDispatchToProps = dispatch => ({
  onLoginStart: () => dispatch(actions.auth.requestLogin()),
  onLoginSuccess: token => dispatch(actions.auth.receiveLogin(token)),
  onLoginFailure: error => dispatch(actions.auth.loginError(error)),
});

const LoginContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login));

export default LoginContainer;
