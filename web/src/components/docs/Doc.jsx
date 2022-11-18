import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import PatternDoc from './patterns.md';
import ProjectDoc from './projects.md';
import GroupDoc from './groups.md';

const docs = {
  patterns: <PatternDoc />,
  projects: <ProjectDoc />,
  groups: <GroupDoc />,
};

const StyledDoc = styled.div`
  img {
    display: block;
    margin: 10px auto;
    max-width: 100%;
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
