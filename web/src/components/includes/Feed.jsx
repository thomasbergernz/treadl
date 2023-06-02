import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';
import UserChip from './UserChip';

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
      console.log(result);
      setFeed(result.feed);
      setLoading(false);
    });  
  }, [username]);
  
  return (
    <div>
      <h2>Feed</h2>
      {feed?.map(item =>
        <div key={item._id} style={{display: 'flex', alignItems: 'center'}}>
          <div style={{marginRight: 5}}>
            <UserChip user={item.userObject} avatarOnly />
          </div>
          <div>
            <span style={{marginRight: 5}}>{item.userObject?.username}</span>
            {item.feedType === 'comment' &&
              <span>commented on an item</span>
            }
            {item.feedType === 'object' &&
              <span>created a new item</span>
            }
            {item.feedType === 'project' &&
              <span>started a new project</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}