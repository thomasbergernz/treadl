import React, { useEffect } from 'react';
import { Loader, Button, Segment } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import FeedMessage from 'components/includes/FeedMessage';
import NewFeedMessage from 'components/includes/NewFeedMessage';
import MessagesImage from 'images/messages.png';

function Feed({ user, group, entries, onReceiveEntry, onDeleteEntry, newEntry, onJoinGroup, replyingTo, updateReplyingTo, loadingEntries, updateLoadingEntries, match }) {
  const myGroups = user?.groups || [];

  useEffect(() => {
    updateLoadingEntries(true);
    api.groups.getEntries(match.params.id, entries => {
      updateLoadingEntries(false);
      entries.forEach(e => onReceiveEntry(e));
    });
  }, [match.params.id, myGroups.length, onReceiveEntry, updateLoadingEntries]);

  const mainEntries = entries && entries.filter(e => !e.inReplyTo);
  
  return (
    <div>
      {utils.isInGroup(user, group._id) && <>
        {replyingTo ?
          <Button style={{marginBottom: 20}} color='teal' content='Write a new post' onClick={() => updateReplyingTo(null)} /> 
        :
          <NewFeedMessage user={user} group={group} forType='group' onPosted={onReceiveEntry}/>
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
          <FeedMessage key={e._id} user={user} forType='group' group={group} post={e} replies={entries.filter(r => r.inReplyTo === e._id)} onDeleted={onDeleteEntry} onReplyPosted={onReceiveEntry} />
        )}
      </>}
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.match.params;
  const group = state.groups.groups.filter(g => g._id === id)[0];
  const entries = state.groups.entries.filter(e => e.group === id).sort((a, b) => {
    const aDate = new Date(a.createdAt);
    const bDate = new Date(b.createdAt);
    return aDate < bDate;
  });
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const projects = state.projects.projects.filter(p => p.user === (user && user._id));
  const { replyingTo } = state.posts;
  return { user, group, loading: state.groups.loading, errorMessage: state.groups.errorMessage, projects, newEntry: state.groups.newEntry, entries, replyingTo, loadingEntries: state.groups.loadingEntries };
};
const mapDispatchToProps = dispatch => ({
  onReceiveEntry: entry => dispatch(actions.groups.receiveEntry(entry)),
  onDeleteEntry: id => dispatch(actions.groups.deleteEntry(id)),
  onJoinGroup: (userId, groupId) => dispatch(actions.users.joinGroup(userId, groupId)),
  updateReplyingTo: entryId => dispatch(actions.posts.updateReplyingTo(entryId)),
  updateLoadingEntries: l => dispatch(actions.groups.updateLoadingEntries(l)),
});
const FeedContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(Feed));

export default FeedContainer;
