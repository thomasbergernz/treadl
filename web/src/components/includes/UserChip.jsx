import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Avatar from 'boring-avatars';
import utils from '../../utils/utils.js';

import SupporterBadge from './SupporterBadge';

const StyledChip = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
`;
const CustomAvatar = styled.div`
  display: block;
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
  margin-left: 5px;
  color: black;
`;

function UserChip({ user, compact, meta, withoutLink, avatarOnly, style }) {
  if (!user) return null;
  return (
    <div style={{display: 'inline-block'}}>
      <StyledChip to={withoutLink ? '#' : `/${user.username}`} style={style || {}}>
          {user.avatar ?
            <CustomAvatar compact={compact} user={user} avatarOnly={avatarOnly} />
          :
            <Avatar
              size={compact ? 15 : 30}
              name={user.username}
              variant="beam"
              colors={["#B2A4FF", "#FFB4B4", "#FFDEB4", "#FDF7C3"]}
            />
          }
          {user.isGoldSupporter && <Badge><SupporterBadge compact type='gold' /></Badge>}
          {user.isSilverSupporter && !user.isGoldSupporter && <Badge><SupporterBadge compact type='silver' /></Badge>}
        {!avatarOnly && <>
          <Username compact={compact}>{user.username}</Username>
          {meta && <span style={{color:'rgb(180,180,180)', fontSize: 10, marginLeft: 10}}>{meta}</span>}
        </>}
      </StyledChip>
    </div>
  );
}

export default UserChip;
