import React, { Component } from 'react';
import {
  Icon, Segment, Form, Button, Divider,
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import utils from 'utils/utils';
import actions from 'actions';
import api from 'api';

import FileChooser from 'components/includes/FileChooser';

class EditProfile extends Component {
  updatePicture = (avatar) => {
    api.users.update(this.props.profileUser.username, { avatar }, this.props.onReceiveUser);
  }

  updateProfile = () => {
    const { bio, location, website } = this.props.profileUser;
    api.users.update(this.props.profileUser.username, { bio, location, website }, (user) => {
      this.props.onReceiveUser(user);
      toast.info('Profile saved');
    }, err => toast.error(err.message));
  }

  updateSocial = () => {
    const { twitter, facebook, linkedIn, instagram } = this.props.profileUser;
    api.users.update(this.props.profileUser.username, { twitter, facebook, linkedIn, instagram }, (user) => {
      this.props.onReceiveUser(user);
      toast.info('Profile saved');
    }, err => toast.error(err.message));
  }

  render() {
    const { profileUser, onUserEdited } = this.props;
    return (
      <div>
        <Link to={`/${profileUser.username}`} className="ui basic button">
          <Icon name="arrow left" /> Back to profile
        </Link>
        <h3>Edit public profile</h3>
        <Divider hidden />

        <Segment raised color="blue">
          <h3>Essentials</h3>

          <h5>Profile picture</h5>
          <FileChooser
            forType="user" for={profileUser}
            trigger=<Button basic color="yellow" icon="image" content="Choose an image" />
            accept="image/*" onComplete={f => this.updatePicture(f.storedName)}
          />
          <h4>Or choose one of ours:</h4>
          {utils.defaultAvatars().map(a => (
            <img
              alt="Default avatar" key={a.key} src={a.url}
              style={{
                width: 40, height: 40, margin: 4, cursor: 'pointer',
              }}
              onClick={e => this.updatePicture(a.key)}
            />
          ))}
          <Divider hidden />

          <Form>
            <Form.TextArea
              label="Bio" placeholder="Write a bit about yourself..."
              value={profileUser.bio}
              onChange={e => onUserEdited(profileUser._id, { bio: e.target.value })}
            />
            <Form.Input
              label="Location" placeholder="Where in the world are you?" icon="map pin" iconPosition="left"
              value={profileUser.location}
              onChange={e => onUserEdited(profileUser._id, { location: e.target.value })}
            />
            <Form.Input
              label="Website or URL" placeholder="https://yourwebsite.com" icon="globe" iconPosition="left"
              value={profileUser.website}
              onChange={e => onUserEdited(profileUser._id, { website: e.target.value })}
            />
            <Form.Button color="yellow" content="Save profile" onClick={this.updateProfile} />
          </Form>
        </Segment>

        <Segment raised color="blue">
          <h3>Social</h3>
          <p>Let others know where else they can find you.</p>
          <Form>
            <Form.Input
              label="Twitter" placeholder="@username" icon="twitter" iconPosition="left"
              value={profileUser.twitter}
              onChange={e => onUserEdited(profileUser._id, { twitter: e.target.value })}
            />
            <Form.Input
              label="Facebook" placeholder="username" icon="facebook" iconPosition="left"
              value={profileUser.facebook}
              onChange={e => onUserEdited(profileUser._id, { facebook: e.target.value })}
          />
          <Form.Input
              label="Instagram" placeholder="username" icon="instagram" iconPosition="left"
              value={profileUser.instagram}
              onChange={e => onUserEdited(profileUser._id, { instagram: e.target.value })}
            />
            <Form.Input
              label="LinkedIn" placeholder="username" icon="linkedin" iconPosition="left"
              value={profileUser.linkedIn}
              onChange={e => onUserEdited(profileUser._id, { linkedIn: e.target.value })}
            />
            <Form.Button color="yellow" content="Save social profiles" onClick={this.updateSocial} />
          </Form>
        </Segment>

      </div>);
  }
}

const mapStateToProps = (state, ownProps) => {
  const users = state.users.users;
  const profileUser = users.filter(u => ownProps.match.params.username === u.username)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user, profileUser };
};
const mapDispatchToProps = dispatch => ({
  onUserEdited: (id, data) => dispatch(actions.users.update(id, data)),
  onReceiveUser: user => dispatch(actions.users.receive(user)),
});
const EditProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditProfile);

export default EditProfileContainer;
