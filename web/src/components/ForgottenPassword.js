import React, { Component } from 'react';
import {
  Card, Input, Divider, Button,
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import api from 'api';

class ForgottenPassword extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '', loading: false };
  }

  sendEmail = () => {
    this.setState({ loading: true });
    api.auth.sendPasswordResetEmail(this.state.email, () => {
      this.setState({ loading: false });
      toast.info('If your account exists, a password email has been sent');
      this.props.history.push('/');
    }, (err) => {
      this.setState({ loading: false });
      toast.error(err.message);
    });
  }

  render() {
    const { email, loading } = this.state;
    return (
      <Card.Group centered style={{ marginTop: 50 }}>
        <Card raised color="yellow">
          <Card.Content>
            <Card.Header>Forgotten your password?</Card.Header>
            <Card.Meta>Type your email address below, and we'll send you a password-reset email.</Card.Meta>
            <Divider hidden />
            <Input fluid type="email" value={email} onChange={e => this.setState({ email: e.target.value })} placeholder="mary@example.com" autoFocus />
          </Card.Content>
          <Card.Content extra textAlign="right">
            <Button basic onClick={this.props.history.goBack} content="Cancel" />
            <Button color="teal" content="Send email" onClick={this.sendEmail} loading={loading} />
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }
}

const mapStateToProps = state => ({ });
const mapDispatchToProps = dispatch => ({
});
const ForgottenPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ForgottenPassword);

export default ForgottenPasswordContainer;
