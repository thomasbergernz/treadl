import React, { useState, useEffect } from 'react';
import { Container, Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api';
import utils from '../../../utils/utils.js';

import UserChip from '../../includes/UserChip';
import DraftPreview from '../projects/objects/DraftPreview';

export default function Explore() {
  const [loading, setLoading] = useState(false);
  
  const { objects, users } = useSelector(state => {
    return { objects: state.objects.exploreObjects, users: state.users.exploreUsers };
  });
  
  return (
    <Container style={{ marginTop: '40px' }}>
      <h1>Recent patterns on {utils.appName()}</h1>
      
      <Card.Group stackable doubling itemsPerRow={3} style={{marginTop: 30}}>
        {objects?.filter(o => o.projectObject && o.userObject).map(object =>
          <Card raised key={object._id} style={{ cursor: 'pointer' }} as={Link} to={`/${object.userObject?.username}/${object.projectObject?.path}/${object._id}`}>
            <div style={{ height: 200, backgroundImage: `url(${object.preview})`, backgroundSize: 'cover', backgroundPosition: 'top right', position: 'relative' }}>
              {object.userObject && 
                <div style={{position: 'absolute', top: 5, left: 5, padding: 3, background: 'rgba(250,250,250,0.5)', borderRadius: 5}}>
                  <UserChip user={object.userObject} />
                </div>
              }
            </div>
            <Card.Content>
              <p style={{ wordBreak: 'break-all' }}>{object.name}</p>
              {object.projectObject?.path &&
                <p style={{fontSize: 11, color: 'black'}}>{object.projectObject.path}</p>
              }
            </Card.Content>
          </Card>
        )}
      </Card.Group>
      
    </Container>
  )
}