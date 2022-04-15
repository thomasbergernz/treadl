import React, { Component } from 'react';
import { Message, Input, Segment, Button } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';

import actions from 'actions';
import api from 'api';

class IdentitySettings extends Component {
  constructor(props) {
    super(props);
    this.state = { newUsername: '' };
  }

  updateUsername = () => {
    api.users.update(this.props.user.username, { username: this.state.newUsername }, (user) => {
      this.props.onUpdateUsername(this.props.user._id, this.state.newUsername);
      toast.info('Username updated');
      this.setState({ newUsername: '' });
    }, err => toast.error(err.message));
  }

  render() {
    return (
      <Segment raised color="blue">
        <h3>Username</h3>
        <p>Change the username you use for your profile and to login to Treadl.</p>

        <Message>
          <p><strong>Changing your username can have unintended side-effects</strong></p>
          <p>Project URLs and other links are associated with your username, so any links to projects you've shared may not work correctly after you've changed your username.</p>
          <p>If you change your username, your old one will become available to be taken by somebody else.</p>
        </Message>
        <Input
          type="text" value={this.state.newUsername}
          onChange={e => this.setState({ newUsername: e.target.value })}
          action=<Button color="yellow" content="Set new username" onClick={this.updateUsername} />
        />
      </Segment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user };
};
const mapDispatchToProps = dispatch => ({
  onUpdateUsername: (id, username) => dispatch(actions.users.updateUsername(id, username)),
});
const IdentitySettingsContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(IdentitySettings));

export default IdentitySettingsContainer;
