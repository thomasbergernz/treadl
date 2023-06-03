import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Message, Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { BulletList } from 'react-content-loader'
import api from '../../api';
import UserChip from './UserChip';
import DiscoverCard from './DiscoverCard';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });
  const username = user?.username;
  
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api.users.getFeed(username, result => {
      setFeed(result.feed);
      setLoading(false);
    });  
  }, [username]);
  
  return (
    <Card fluid>
      <Card.Content style={{maxHeight: 300, overflowY: 'scroll'}}>
      <Card.Header style={{marginBottom: 10}}>Recent activity</Card.Header>
      {loading &&
        <div>
          <BulletList />
        </div>
      }
      {!loading && !feed?.length &&
        <div>
          <Message size='tiny'>Your feed is empty. You can <Link to='/explore'>follow others</Link> to stay up-to-date.</Message>
          <DiscoverCard />
        </div>
      }
      {!loading && feed?.map(item =>
        <div key={item._id} style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
          <div style={{marginRight: 5}}>
            <UserChip user={item.userObject} avatarOnly />
          </div>
          <div>
            <span style={{marginRight: 5}}><Link to={`/${item.userObject?.username}`}>{item.userObject?.username}</Link></span>
            {item.feedType === 'comment' &&
              <span>wrote a comment
              {item.projectObject?.userObject && item.object &&
                <span> on <Link to={`/${item.projectObject.userObject.username}/${item.projectObject.path}/${item.object}`}>an item</Link> in {item.projectObject.name}</span>
              }
              </span>
            }
            {item.feedType === 'object' &&
              <span>created a new item 
                {item.projectObject?.userObject &&
                  <span> in <Link to={`/${item.projectObject.userObject.username}/${item.projectObject.path}`}>{item.projectObject.name}</Link></span>
                }
              </span>
            }
            {item.feedType === 'project' &&
              <span>started a new project: {item.name}</span>
            }
          </div>
        </div>
      )}
      </Card.Content>
    </Card>
  );
}