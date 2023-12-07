import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import PatternDoc from './patterns.md';
import ProjectDoc from './projects.md';
import GroupDoc from './groups.md';
import AccountDoc from './account.md';

const docs = {
  patterns: <PatternDoc />,
  projects: <ProjectDoc />,
  groups: <GroupDoc />,
  account: <AccountDoc />,
};

const StyledDoc = styled.div`
  img {
    display: block;
    margin: 20px auto;
    max-width: 100%;
    max-height: 500px;
  }
`;

export default function Doc() {
  const { doc } = useParams();
  return (
    <div>
      <StyledDoc>
        {docs[doc]}
      </StyledDoc>
    </div>
  );
}
