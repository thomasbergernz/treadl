import React, { useState, useEffect } from 'react';
import { Card, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UserChip from './UserChip';
import api from '../../api';
import utils from '../../utils/utils.js';

export default function ExploreCard({ count }) {
  const [highlightProjects, setHighlightProjects] = useState([]);
  const [highlightUsers, setHighlightUsers] = useState([]);
  
  useEffect(() => {
    api.search.discover(count || 3, ({ highlightProjects, highlightUsers }) => {
      setHighlightProjects(highlightProjects);
      setHighlightUsers(highlightUsers);
    });
  }, []);
  
  if ((highlightProjects?.length === 0 || highlightUsers?.length === 0)) return null;

  return (
    <Card fluid>
      <Card.Content>
        {highlightProjects?.length > 0 && <>
          <h4>Discover a project</h4>
          <List relaxed>
            {highlightProjects.map(p =>
              <List.Item key={p._id}>
                <List.Icon name='book' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header className='umami--click--discover-project' as={Link} to={`/${p.fullName}`}>{p.name}</List.Header>
                </List.Content>
              </List.Item>
            )}
          </List>
        </>}
  
        {highlightUsers?.length > 0 && <>
          <h4>Find others on {utils.appName()}</h4>
          <List relaxed>
            {highlightUsers.map(u =>
              <List.Item key={u._id}>
                <List.Content>
                  <UserChip user={u} className='umami--click--discover-user'/>
                </List.Content>
              </List.Item>
            )}
          </List>
        </>}
      </Card.Content>
    </Card>
  );
}