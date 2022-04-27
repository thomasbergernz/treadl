import React from 'react';
import styled from 'styled-components';

export const LinkContainer = styled.span`
  display: inline-block;
  border: 1px solid rgb(240,240,240);
  border-radius: 5px;
  padding: 5px;
  ${p => p.marginTop ? 'margin-top: 10px;' : ''}
  ${p => p.marginLeft ? 'margin-left: 10px;' : ''}
  ${p => p.marginBottom ? 'margin-bottom: 10px;' : ''}
  color: #1e70bf;
  cursor: pointer;
  .emoji{
    margin-right: 5px;
  }
`;
//export LinkContainer;

function HelpLink({ className, text, link, marginTop, marginLeft, marginBottom, style }) {
  if (!link) return null;
  return (
    <LinkContainer style={style} marginTop={marginTop} marginLeft={marginLeft} marginBottom={marginBottom}>
      <a className={className} href={link} target='_blank' rel='noopener noreferrer'>
        <span className='emoji'>🪧</span>
        {text || 'Get help with this page'}
      </a>
    </LinkContainer>
  );
}

export default HelpLink;
