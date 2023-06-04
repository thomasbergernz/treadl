import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../actions';
import api from '../../api';

export default function FollowButton({ targetUser, compact, onChange }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });

  function follow(following) {
    if (!user) return;
    const f = following ? api.users.follow : api.users.unfollow;
    f(targetUser?.username, result => {
      dispatch(actions.users.receive({ ...targetUser, following }));
      onChange(following);
    }, err => {
      toast.error(err.message);
    });
  }

  return (
    targetUser.following ?
      <Button fluid size={compact ? 'mini': 'small'} basic color='blue' onClick={e => follow(false)}><Icon name='check' /> Following</Button>
    :
      <Button fluid size={compact ? 'mini': 'small'} color='blue' onClick={e => follow(true)} data-tooltip={user ? null : 'You need to be logged-in to follow someone'}>Follow</Button>
  );
}