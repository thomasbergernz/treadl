import React, { Component } from 'react';
import { Icon, Divider, Card, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';

import ProjectCard from 'components/includes/ProjectCard';

class ProfileProjects extends Component {
  render() {
    const { profileUser } = this.props;
    return (
      <div>
        <h3><Icon name='book' /> {profileUser.username}'s projects</h3>
        <Divider hidden />
        {(profileUser.projects && profileUser.projects.length > 0)
          ? (
            <Card.Group itemsPerRow={3} stackable>
              {profileUser.projects.map(proj => (
                <ProjectCard key={proj._id} project={proj} />
              ))}
            </Card.Group>
          )
          : (
            <Message>
              <span role="img" aria-label="monkey hiding eyes">🙈</span> {profileUser.username} doesn't have any projects yet.
            </Message>
          )
      }
      </div>);
  }
}

const mapStateToProps = (state, ownProps) => {
  const users = state.users.users;
  const profileUser = users.filter(u => u.username === ownProps.match.params.username)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user, profileUser };
};
const ProfileProjectsContainer = connect(
  mapStateToProps,
)(ProfileProjects);

export default ProfileProjectsContainer;
