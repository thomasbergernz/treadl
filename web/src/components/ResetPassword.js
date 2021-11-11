import React, { Component } from 'react';
import {
  Card, Input, Divider, Button,
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import api from 'api';

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = { password: '', loading: false };
  }

  resetPassword = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    this.setState({ loading: true });
    api.auth.updatePasswordWithToken(token, this.state.password, () => {
      this.setState({ loading: false });
      toast.info('Password changed successfully.');
      this.props.history.push('/');
    }, (err) => {
      this.setState({ loading: false });
      toast.error(err.message);
    });
  }

  render() {
    const { password, loading } = this.state;
    return (
      <Card.Group centered style={{ marginTop: 50 }}>
        <Card raised color="yellow">
          <Card.Content>
            <Card.Header>Enter a new password</Card.Header>
            <Card.Meta>Enter a new password below.</Card.Meta>
            <Divider hidden />
            <Input fluid type="password" value={password} onChange={e => this.setState({ password: e.target.value })} autoFocus />
          </Card.Content>
          <Card.Content extra textAlign="right">
            <Button color="teal" content="Change password" onClick={this.resetPassword} loading={loading} />
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }
}

const mapStateToProps = state => ({ });
const mapDispatchToProps = dispatch => ({
});
const ResetPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResetPassword);

export default ResetPasswordContainer;
