import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import utils from '../../utils/utils.js';

import SupporterBadge from './SupporterBadge';

const Avatar = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => props.compact ? 15 : 30}px;
  height: ${props => props.compact ? 15 : 30}px;
  border-radius: 50%;
  background-size: cover;
  background-position: center center;
  background-image: url(${props => utils.cropUrl(utils.avatarUrl(props.user), 50, 50)});
  vertical-align: middle;
  margin-right: ${props => props.avatarOnly ? 0 : (props.compact ? 4 : 8)}px;
`;
const Badge = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
`;
const Username = styled.span`
  font-size: ${props => props.compact ? 10 : 12}px;
`;

function UserChip({ user, compact, meta, withoutLink, avatarOnly, style }) {
  if (!user) return null;
  return (
    <Link to={withoutLink ? '#' : `/${user.username}`} style={style || {}}>
      <Avatar compact={compact} user={user} avatarOnly={avatarOnly}>
        {user.isSilverSupporter && <Badge><SupporterBadge compact type='silver' /></Badge>}
      </Avatar>
      {!avatarOnly && <>
        <Username compact={compact}>{user.username}</Username>
        {meta && <span style={{color:'rgb(180,180,180)', fontSize: 10, marginLeft: 10}}>{meta}</span>}
      </>}
    </Link>
  );
}

export default UserChip;
