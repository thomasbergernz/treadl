import React, { useState, useEffect } from 'react';
import { Card, List, Dimmer } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { BulletList } from 'react-content-loader'
import { useSelector } from 'react-redux';
import UserChip from './UserChip';
import api from '../../api';
import utils from '../../utils/utils.js';
import FollowButton from './FollowButton';

export default function ExploreCard({ count, asCard }) {
  const [highlightProjects, setHighlightProjects] = useState([]);
  const [highlightUsers, setHighlightUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });
  const userId = user?._id;
  
  useEffect(() => {
    setLoading(true);
    api.search.discover(count || 3, ({ highlightProjects, highlightUsers }) => {
      setHighlightProjects(highlightProjects);
      setHighlightUsers(highlightUsers);
      setLoading(false);
    });
  }, [userId]);
  
  function updateFollowing(updateUserId, following) {
    const newHighlightUsers = Object.assign([], highlightUsers).map(u => {
      if (u._id === updateUserId) return { ...u, following };
      else return u;
    });
    setHighlightUsers(newHighlightUsers);
  }
  
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
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <UserChip user={u} className='umami--click--discover-user'/>
                    <div>
                      <FollowButton compact targetUser={u} onChange={f => updateFollowing(u._id, f)} />
                    </div>
                  </div>
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