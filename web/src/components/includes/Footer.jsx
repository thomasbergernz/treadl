import React from 'react';
import { Container, Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import utils from '../../utils/utils.js';
import logo from '../../images/logo/main.png';

const StyledFooter = styled.div`
  background: rgba(0,0,0,0.02);
  padding: 10px;
`;

export default function Footer() {
  return (
    <StyledFooter>
      <Container>
        <Grid verticalAlign='middle' stackable columns={2}>
          <Grid.Column>
            <Link to="/"><img alt={`${utils.appName()} logo`} src={logo} style={{ width: '100px', opacity: 0.5 }} /></Link>
            {import.meta.env.VITE_SOURCE_REPO_URL &&
              <p style={{marginTop: 5 }}><small>{utils.appName()} software is free and open-source.
                <br />
                <Icon name="code" /> <a href={import.meta.env.VITE_SOURCE_REPO_URL} target="_blank" rel="noopener noreferrer" className='umami--click--source-footer'>Project source homepage</a>
              </small></p>
            }
          </Grid.Column>
          <Grid.Column textAlign="right" style={{ fontSize: 13 }}>
            {import.meta.env.VITE_PATREON_URL &&
              <p>
                <Icon name='trophy' />
                <a href={import.meta.env.VITE_PATREON_URL} target='_blank' rel='noopener noreferrer' className='umami--click--patreon-footer'>Become a patron</a>
              </p>
            }
            <p>
              <Icon name='book' />
              <a href='/docs' target='_blank' rel='noopener noreferrer'>Documentation</a>
            </p>
            <p>
              <Icon name="file alternate outline" />
              <Link to="/privacy">Privacy Policy</Link>
            </p>
            <p>
              <Icon name="file alternate outline" />
              <Link to="terms-of-use">Terms of Use</Link>
            </p>
          </Grid.Column>
        </Grid>
      </Container>
    </StyledFooter>
  );
}