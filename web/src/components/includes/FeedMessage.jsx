import React from 'react';
import { connect } from 'react-redux';
import { Button, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
import utils from '../../utils/utils.js';
import actions from '../../actions';
import api from '../../api';

import UserChip from './UserChip';
import NewFeedMessage from './NewFeedMessage';
import FormattedMessage from './FormattedMessage';

const StyledMessage = styled.div`
  padding: 6px;
  border-radius: 4px;
  background: rgba(230,230,230, 0.5);
  position:relative;
  white-space: pre-line;
  &:after{
    content:'';
    position:absolute;
    display:block;
    width:10px;
    height:10px;
    background:rgba(230,230,230, 0.5);
    top:-5px;
    left:10px;
    transform: rotate(45deg);
  }
`;

const FeedMessage = connect(
  (state, ownProps) => {
    return { replyingTo: state.posts.replyingTo };
  }, dispatch => ({
    updateReplyingTo: postId => dispatch(actions.posts.updateReplyingTo(postId))
  })
)(({ user, forType, group, object, post, replies, replyingTo, updateReplyingTo, onDeleted, onReplyPosted }) => {

  const deletePost = (postId) => {
    let deleteFunc, forId;
    if (forType === 'group') {
      deleteFunc = api.groups.deleteEntry;
      forId = group._id;
    }
    if (forType === 'object') {
      deleteFunc = api.objects.deleteComment;
      forId = object._id;
    }
    utils.confirm('Really delete this post?', 'This cannot be undone.').then(() => deleteFunc(forId, postId, () => onDeleted(postId)), () => {});
  }

  const canDelete = () => {
    if (forType === 'group')
      return post.user === user?._id || utils.isGroupAdmin(user, group);
    if (forType === 'object')
      return post.user === user?._id;
  }

  return (
    <div style={{marginBottom: 20}}>
      <UserChip user={post.authorUser} meta={moment(post.createdAt).fromNow()}/>
      {canDelete() &&
        <Dropdown icon='ellipsis horizontal' style={{marginLeft: 10}}>
          <Dropdown.Menu>
            <Dropdown.Item icon='trash' content='Delete' onClick={() => deletePost(post._id)}/>
          </Dropdown.Menu>
        </Dropdown>
      }

      <div style={{marginTop: 10}}>
        <StyledMessage>
          <FormattedMessage content={post.content} />
          {post?.attachments?.length > 0 &&
            <div style={{marginTop: 10}}>
              {post.attachments.filter(e => e.isImage).map(a =>
                <a href={a.url} target='_blank' rel="noopener noreferrer"><div style={{width:100, height: 100, backgroundImage: `url(${a.url})`, backgroundSize: 'cover', backgroundPosition: 'center center', margin: 3, display: 'inline-block'}}/></a>
              )}
              <div />
              {post.attachments.filter(e => e.type === 'project').map(a =>
                <Button as={Link} to={`/${a.fullName}`} size='tiny' icon='book' content={a.name} style={{margin: 4}}/>
              )}
              {post.attachments.filter(e => !e.isImage && e.type === 'file').map(a =>
                <Button as='a' href={a.url} target='_blank' rel="noopener noreferrer" size='tiny' icon='download' content={a.name} style={{margin: 4}}/>
              )}
            </div>
          }
          {!post.inReplyTo &&
            <div style={{padding: 10}}>
              {replyingTo !== post._id && !post.inReplyTo && onReplyPosted &&
                <Button size='mini' basic primary icon='reply' content='Write a reply' onClick={() => updateReplyingTo(post._id)} />
              }
              {post.user === user?._id && !utils.hasSubscription(user, 'messages.replied') && onReplyPosted &&
                <Button size='mini' basic icon='envelope' content='Get notified if someone replies' as={Link} to='/settings/notifications' />
              }
              {replyingTo === post._id &&
                <div style={{marginTop: 10}}><NewFeedMessage autoFocus inReplyTo={post._id} user={user} group={group} object={object} forType={forType} onPosted={onReplyPosted} /></div>
              }
              {replies?.map(reply =>
                <div key={reply._id} style={{marginTop:10}}><FeedMessage user={user} group={group} object={object} forType={forType} post={reply} onDeleted={onDeleted} /></div>
              )}
            </div>
          }
        </StyledMessage>
      </div>
    </div>
  );
});

export default FeedMessage;
