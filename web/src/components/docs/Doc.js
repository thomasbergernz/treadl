import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import patternDoc from './patterns.md';
import projectDoc from './projects.md';
import groupDoc from './groups.md';

const docs = {
  patterns: patternDoc,
  projects: projectDoc,
  groups: groupDoc,
};

const StyledDoc = styled.div`
  img {
    display: block;
    margin: 10px auto;
    max-width: 100%;
  }
`;

function Doc() {
  const [markdown, setMarkdown] = useState();
  const [notFound, setNotFound] = useState(false);
  const { doc } = useParams();

  useEffect(() => {
    async function prepareDoc() {
      if (!docs[doc]) {
        setNotFound(true);
        return;
      }
      const markdownFile = await fetch(docs[doc]);
      const markdown = await markdownFile.text();
      setMarkdown(markdown);
    }
    prepareDoc();
  }, [doc]);

  return (
    <div>
      {notFound ?
        <div>
          <h2>This document could not be found</h2>
          <p>Please select a different document.</p>
        </div>
      :
        <StyledDoc>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </StyledDoc>
      }
    </div>
  );
}
export default Doc;