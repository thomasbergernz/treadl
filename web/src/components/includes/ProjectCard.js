import React from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UserChip from 'components/includes/UserChip';

function ProjectCard({ project }) {

  const shorten = description => {
    if (!description) return '';
    if (description.length < 80) return description;
    return description.substring(0, 77) + '...';
  }

  return (
    <Card raised as={Link} to={{ pathname: `/${project.fullName}`, state: { prevPath: window.location.pathname }}}>
      <Card.Content>
        <Card.Header><Link to={{ pathname: `/${project.fullName}`, state: { prevPath: window.location.pathname }}}>{project.name}</Link></Card.Header>
        <Card.Meta>{shorten(project.description)}</Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <UserChip user={project.owner} />
        <span style={{ float: 'right' }}>
          {project.visibility === 'private'
            ? (
              <span>
                <Icon name="lock" /> Private
              </span>
            )
            : (
              <span>
                <Icon name="unlock" /> Public
              </span>
            )
        }
        </span>
      </Card.Content>
    </Card>
  );
}

export default ProjectCard;
