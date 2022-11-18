import React, { useEffect } from 'react';
import { Loader, Button, Segment } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import utils from '../../../utils/utils.js';
import actions from '../../../actions';
import api from '../../../api';

import FeedMessage from '../../includes/FeedMessage';
import NewFeedMessage from '../../includes/NewFeedMessage';
import MessagesImage from '../../../images/messages.png';

function Feed() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user, group, entries, replyingTo, loadingEntries } = useSelector(state => {
    const group = state.groups.groups.filter(g => g._id === id)[0];
    const entries = state.groups.entries.filter(e => e.group === id).sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);
      return aDate < bDate;
    });
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const { replyingTo } = state.posts;
    return { user, group, entries, replyingTo, loadingEntries: state.groups.loadingEntries };
  });
  const myGroups = user?.groups || [];

  useEffect(() => {
    dispatch(actions.groups.updateLoadingEntries(true));
    api.groups.getEntries(id, entries => {
      dispatch(actions.groups.updateLoadingEntries(false));
      entries.forEach(e => dispatch(actions.groups.receiveEntry(e)));
    });
  }, [dispatch, id, myGroups.length]);

  const mainEntries = entries && entries.filter(e => !e.inReplyTo);

  return (
    <div>
      {utils.isInGroup(user, group._id) && <>
        {replyingTo ?
          <Button style={{marginBottom: 20}} color='teal' content='Write a new post' onClick={() => dispatch(actions.posts.updateReplyingTo(null))} />
        :
          <NewFeedMessage user={user} group={group} forType='group' onPosted={e => dispatch(actions.groups.receiveEntry(e))}/>
        }
        {loadingEntries && !mainEntries?.length &&
          <div style={{textAlign:'center'}}>
            <Loader inline='centered' active />
            <p style={{marginTop: 20}}><strong>Loading the notice board. Hold tight...</strong></p>
          </div>
        }
        {!loadingEntries && !mainEntries?.length &&
          <Segment placeholder textAlign='center'>
            <img src={MessagesImage} alt='Messages' style={{display:'block', margin: '0px auto', maxWidth: 300}} />
            <h2>No posts yet</h2>
            <p>Be the first here by writing a new post.</p>
          </Segment>
        }
        {mainEntries?.map(e =>
          <FeedMessage key={e._id} user={user} forType='group' group={group} post={e} replies={entries.filter(r => r.inReplyTo === e._id)} onDeleted={id => dispatch(actions.groups.deleteEntry(id))} onReplyPosted={e => dispatch(actions.groups.receiveEntry(e))} />
        )}
      </>}
    </div>
  )
}

export default Feed;
