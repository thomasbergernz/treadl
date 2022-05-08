import React from 'react';
import { Container } from 'semantic-ui-react';
import { Outlet } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';

function Docs() {
  return (
    <Container style={{marginTop: 40}}>
      <h1>Treadl documentation</h1>
      <Divider section />
      <Outlet />
    </Container>
  );
};
export default Docs;