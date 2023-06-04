import React, { useState, useEffect } from 'react';
import { Card, List, Dimmer } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { BulletList } from 'react-content-loader'
import UserChip from './UserChip';
import api from '../../api';
import utils from '../../utils/utils.js';

export default function ExploreCard({ count, asCard }) {
  const [highlightProjects, setHighlightProjects] = useState([]);
  const [highlightUsers, setHighlightUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    api.search.discover(count || 3, ({ highlightProjects, highlightUsers }) => {
      setHighlightProjects(highlightProjects);
      setHighlightUsers(highlightUsers);
      setLoading(false);
    });
  }, []);
  
  function getContent() {
    return (
      <div>
        <h4>Discover a project</h4>
        {loading && <BulletList />}
        {highlightProjects?.length > 0 && <>
          <List relaxed>
            {highlightProjects?.map(p =>
              <List.Item key={p._id}>
                <List.Icon name='book' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header className='umami--click--discover-project' as={Link} to={`/${p.fullName}`}>{p.name}</List.Header>
                </List.Content>
              </List.Item>
            )}
          </List>
        </>}
        
        <h4>Find others on {utils.appName()}</h4>
        {loading && <BulletList />}
        {highlightUsers?.length > 0 && <>
          <List relaxed>
            {highlightUsers?.map(u =>
              <List.Item key={u._id}>
                <List.Content>
                  <UserChip user={u} className='umami--click--discover-user'/>
                </List.Content>
              </List.Item>
            )}
          </List>
        </>}
      </div>
    );
  }
  
  if (asCard)
    return (
      <Card fluid>
        <Card.Content>
          {getContent()}
        </Card.Content>
      </Card>
    );
  
  return getContent();
}