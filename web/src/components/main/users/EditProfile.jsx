import React from 'react';
import {
  Icon, Segment, Form, Button, Divider,
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import utils from '../../../utils/utils';
import actions from '../../../actions';
import api from '../../../api';

import FileChooser from '../../includes/FileChooser';

function EditProfile() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profileUser } = useSelector(state => {
    const users = state.users.users;
    const profileUser = users.filter(u => username === u.username)[0];
    return { profileUser };
  });

  const updatePicture = (avatar) => {
    api.users.update(profileUser.username, { avatar }, u => dispatch(actions.users.receive(u)));
  };

  const updateProfile = () => {
    const { bio, location, website } = profileUser;
    api.users.update(profileUser.username, { bio, location, website }, (u) => {
      dispatch(actions.users.receive(u));
      toast.info('Profile saved');
    }, err => toast.error(err.message));
  };

  const updateSocial = () => {
    const { twitter, facebook, linkedIn, instagram } = profileUser;
    api.users.update(profileUser.username, { twitter, facebook, linkedIn, instagram }, (u) => {
      dispatch(actions.users.receive(u));
      toast.info('Profile saved');
    }, err => toast.error(err.message));
  };

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
          forType="user" forObject={profileUser}
          trigger={<Button basic color="yellow" icon="image" content="Choose an image" />}
          accept="image/*" onComplete={f => updatePicture(f.storedName)}
        />
        <Divider hidden />

        <Form>
          <Form.TextArea
            label="Bio" placeholder="Write a bit about yourself..."
            value={profileUser.bio}
            onChange={e => dispatch(actions.users.update(profileUser._id, { bio: e.target.value }))}
          />
          <Form.Input
            label="Location" placeholder="Where in the world are you?" icon="map pin" iconPosition="left"
            value={profileUser.location}
            onChange={e => dispatch(actions.users.update(profileUser._id, { location: e.target.value }))}
          />
          <Form.Input
            label="Website or URL" placeholder="https://yourwebsite.com" icon="globe" iconPosition="left"
            value={profileUser.website}
            onChange={e => dispatch(actions.users.update(profileUser._id, { website: e.target.value }))}
          />
          <Form.Button color="yellow" content="Save profile" onClick={updateProfile} />
        </Form>
      </Segment>

      <Segment raised color="blue">
        <h3>Social</h3>
        <p>Let others know where else they can find you.</p>
        <Form>
          <Form.Input
            label="Twitter" placeholder="@username" icon="twitter" iconPosition="left"
            value={profileUser.twitter}
            onChange={e => dispatch(actions.users.update(profileUser._id, { twitter: e.target.value }))}
          />
          <Form.Input
            label="Facebook" placeholder="username" icon="facebook" iconPosition="left"
            value={profileUser.facebook}
            onChange={e => dispatch(actions.users.update(profileUser._id, { facebook: e.target.value }))}
        />
        <Form.Input
            label="Instagram" placeholder="username" icon="instagram" iconPosition="left"
            value={profileUser.instagram}
            onChange={e => dispatch(actions.users.update(profileUser._id, { instagram: e.target.value }))}
          />
          <Form.Input
            label="LinkedIn" placeholder="username" icon="linkedin" iconPosition="left"
            value={profileUser.linkedIn}
            onChange={e => dispatch(actions.users.update(profileUser._id, { linkedIn: e.target.value }))}
          />
          <Form.Button color="yellow" content="Save social profiles" onClick={updateSocial} />
        </Form>
      </Segment>

    </div>);
}

export default EditProfile;
