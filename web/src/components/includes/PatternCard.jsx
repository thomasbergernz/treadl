import React from 'react';
import { Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UserChip from './UserChip';

export default function PatternCard({ object, project, user }) {
  if (!object) return null;
  return (
    <Card raised key={object._id} style={{ cursor: 'pointer' }} as={Link} to={`/${user?.username}/${project?.path}/${object._id}`}>
      <div style={{ height: 200, backgroundImage: `url(${object.preview})`, backgroundSize: 'cover', backgroundPosition: 'top right', position: 'relative' }}>
        {user && 
          <div style={{position: 'absolute', top: 5, left: 5, padding: '3px 6px', background: 'rgba(250,250,250,0.8)', borderRadius: 5}}>
            <UserChip user={user} />
          </div>
        }
      </div>
      <Card.Content>
        <p style={{ wordBreak: 'break-all' }}>{object.name}</p>
        {project?.path &&
          <p style={{fontSize: 11, color: 'black'}}>{project.path}</p>
        }
      </Card.Content>
    </Card>
  );
}