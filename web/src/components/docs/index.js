import React from 'react';
import { Container } from 'semantic-ui-react';
import { Outlet } from 'react-router-dom';

function Docs() {
  return (
    <Container style={{marginTop: 40}}>
      <h1>Treadl documentation</h1>

      <Outlet />
    </Container>
  );
};
export default Docs;