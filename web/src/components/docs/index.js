import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Switch, Route, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import stuff from './stuff.md';

function Docs({ }) {
  const [markdown, setMarkdown] = useState();

  const getDoc = async key => {
    const markdownFile = await fetch(stuff);//.then(res => res.text()).then(text => this.setState({ markdown: text }));
    const markdown = await markdownFile.text();
    console.log(markdown);
    setMarkdown(markdown);
  };

  return (
    <Container>
      <h1>Treadl documentation</h1>
      <ReactMarkdown># Hello, *world*!</ReactMarkdown>
      <ReactMarkdown>{stuff}</ReactMarkdown>

      <Switch>
        <Route path="/docs/project" component={<ReactMarkdown>{markdown}</ReactMarkdown>} />
      </Switch>
    </Container>
  );
};
export default Docs;