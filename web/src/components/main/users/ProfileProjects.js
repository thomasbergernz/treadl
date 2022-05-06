import React from 'react';
import { Icon, Divider, Card, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import ProjectCard from 'components/includes/ProjectCard';

function ProfileProjects() {
  const { username } = useParams();
  const { profileUser } = useSelector(state => {
    const users = state.users.users;
    const profileUser = users.filter(u => u.username === username)[0];
    return { profileUser };
  });

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

export default ProfileProjects;
