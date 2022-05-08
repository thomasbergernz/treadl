import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import stuff from './stuff.md';

const docs = {
  stuff: stuff,
};

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
        <div>
          <h2>Doc</h2>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      }
    </div>
  );
}
export default Doc;