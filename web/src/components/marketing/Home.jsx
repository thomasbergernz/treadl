import React from 'react';
import { Helmet } from 'react-helmet';
import { Divider, Grid, Button, Container, Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import utils from '../../utils/utils.js';

import PatternCard from '../includes/PatternCard';
import projectImage from '../../images/project.png';
import toolsImage from '../../images/tools.png';
import filesImage from '../../images/files.png';

const StyledHero = styled.div`
  background: linen;
  min-height: 200px;
  margin-top: 10px;
`;

function MarketingHome({ onRegisterClicked }) {
  const { objects } = useSelector(state => {
    return { objects: state.objects.exploreObjects };
  });
  
  return (
    <div>
      <Helmet title='Home' />
      <StyledHero>
        <Container>
          <Grid stackable verticalAlign='middle'>
            <Grid.Column computer={6} tablet={8}>
              <h1>The perfect <span role="img" aria-label="house">🏠</span> home for your weaving projects
              </h1>
              <h4>Use {utils.appName()} to host your projects, draft your weaving patterns using our fab draft editor, and join weaving communities to discover what others are making.</h4>
              <Divider hidden />

              <h2 style={{ marginBottom: 0 }}>Get started today</h2>
              <p>It takes less than 30 seconds to sign-up.</p>
              <Button size="large" color="teal" onClick={onRegisterClicked} style={{ marginBottom: '20px' }}>Create your free account</Button>
              <div style={{
                borderRadius: 4, boxShadow: 'inset 0px 0px 5px rgba(0,0,0,0.1)', backgroundColor: 'rgba(250,250,250,0.1)', padding: 10,
              }}
              >
                <h4><span role="img" aria-label="party" style={{marginRight: 10}}>🎉</span> {utils.appName()} is free</h4>
                <p>The {utils.appName()} software is <a href='#why-free'>free to use</a></p>
                <h4><span role="img" aria-label="coder" style={{marginRight: 10}}>🧑‍💻</span> {utils.appName()} is open-source</h4>
                <p>The code powering {utils.appName()} is <a href={import.meta.env.VITE_SOURCE_REPO_URL} target="_blank" rel="noopener noreferrer">publicly available</a>.</p>
              </div>
            </Grid.Column>

            <Grid.Column computer={10} tablet={8}>
              <video
                style={{
                  maxWidth: '100%', display: 'block', borderRadius: '6px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                }}
                autoPlay loop muted playsInline
              >
                <source src="https://treadl.eu-central-1.linodeobjects.com/assets/intro.mp4" />
              </video>
            </Grid.Column>
          </Grid>
        </Container>
      </StyledHero>
      
      {objects?.length > 0 &&
        <div style={{paddingTop: 75, marginBottom: 75, background: 'linear-gradient(linen, rgb(255,251,248)'}}>
          <Container>
            <div style={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
              <h2>See what people have been creating</h2>
              <Button as={Link} to='/explore'>Explore more</Button>
            </div>
            <Card.Group stackable doubling itemsPerRow={3} style={{marginTop: 30}}>
              {objects?.filter(o => o.projectObject && o.userObject).slice(0, 2).map(object =>
                <PatternCard object={object} project={object.projectObject} user={object.userObject} />
              )}
            </Card.Group>
          </Container>
        </div>
      }

      <Container style={{ marginTop: 50 }}>
        <Grid stackable centered>
          <Grid.Column computer={6} textAlign="right">
            <h2>
              <span role="img" aria-label="sharing hands">👐</span> Host and share your projects
            </h2>
            <p>Use {utils.appName()} to organise your patterns into projects - along with images, text, and other files.</p>
            <p>Each project gets its own unique address, which you can use to share with others (or keep them private - it's up to you). Choose whether your projects are open-source, allowing visitors to export the source WIF files of your patterns for them to download and use in their own projects.</p>
            <p>Projects can contain any mixture of file types. Include images, text files, and other items amongst your patterns.</p>
          </Grid.Column>
          <Grid.Column computer={8}>
            <img alt="Project layout" src={projectImage} style={{ maxWidth: '100%', borderRadius: 4, boxShadow: '0px 5px 5px rgba(0,0,0,0.2)' }} />
          </Grid.Column>
        </Grid>
      </Container>

      <Divider hidden section />
      <Divider hidden section />

      <Grid stackable centered style={{ background: 'rgb(245,245,245)', paddingBottom: 30 }}>
        <Grid.Column computer={10} tablet={16}>
          <img alt="Lots of file types" src={filesImage} style={{ maxWidth: '100%', margin: '0px auto' }} />
        </Grid.Column>
        <Grid.Column computer={8} tablet={10} textAlign="center">
          <h2>
            <span role="img" aria-label="people holding hands">👭</span> {utils.appName()} fits into your workflow
          </h2>
          <p>{utils.appName()} <strong>works well with other weaving tools</strong> by supporting the <a href="http://www.mhsoft.com/wif/wif.html" target="_blank" rel="noopener noreferrer">Weaving Information File (WIF) standard</a>.
          </p>
          <p>This means that if you use Fiberworks, pixeLoom, WeaveIt, or other software for developing your patterns or for interacting with your loom, then {utils.appName()} can be used to import and export patterns to easily fit into your workflow.</p>
          <p>Found a weaving draft online? Simply import it into your project and continue to edit it.</p>
        </Grid.Column>
      </Grid>

      <Divider hidden section />
      <Divider hidden section />

      <Container>
        <Grid stackable centered>
          <Grid.Column computer={8} tablet={8}>
            <img alt="Pattern editor" src={toolsImage} style={{ maxWidth: '100%', borderRadius: 4, boxShadow: '0px 5px 5px rgba(0,0,0,0.2)' }} />
          </Grid.Column>
          <Grid.Column computer={6}>
            <h2>Familiar pattern tooling</h2>
            <p>{utils.appName()} supports many of the features you may already be used to (plus some nice extras).</p>
            <p>
              <span role="img" aria-label="pencil">✏️ </span> Create your drafts using tools such as point draw and line draw.
            </p>
            <p>
              <span role="img" aria-label="paint palette">🎨</span> Use palettes to edit thread colours. Drag over the colourways to quickly recolour lots of threads in one go.
            </p>
            <p>
              <span role="img" aria-label="magnifying glass">🔍</span> Enlarge or shrink your pattern to make it easier to edit in bulk or more precisely.
            </p>
            <p>
              <span role="img" aria-label="painting">🖼️</span> {utils.appName()} generates previews of your patterns as you edit them to let you identify them easily from the project browser.
            </p>
            <p>
              <span role="img" aria-label="laptop">💻</span> Access your projects and manage and edit your patterns at any time from anywhere. Patterns in the cloud mean you don't need to carry them around or back them up on USB drives.
            </p>
            <p>
              <span role="img" aria-label="wip">🚧</span> We might not have everything you need quite yet, but you can always export your patterns to continue to make changes using another tool and then re-import them at a later time.
            </p>
          </Grid.Column>
        </Grid>
      </Container>

      <Divider hidden section />
      <Divider hidden section />

      <Grid stackable centered style={{ background: 'rgb(245,245,245)', paddingTop: 40, paddingBottom: 40 }}>
        <Grid.Column computer={8} textAlign="center">
          <h2>
            <span role="img" aria-label="padlock">🔒</span> Safe and secure
          </h2>
          <p>We take your security and privacy very seriously. You can confidently use {utils.appName()} for storing and backing-up your weaving projects to the cloud.</p>
        </Grid.Column>
      </Grid>

      <Divider hidden section />
      <Divider hidden section />

      <Container>
        <Grid stackable centered>
          <Grid.Column computer={6}>
            <h4>Why join?</h4>
            <p>Everything above and...</p>
            <p>
              <span role="img" aria-label="thumbs up">👍</span> It's free (<a href='#why-free'>How?</a>)
            </p>
            <p>
              <span role="img" aria-label="runner">🏃</span> Quick &amp; easy to use
            </p>
            <p>
              <span role="img" aria-label="hug">🤗</span> Friendly and familiar interface
            </p>
            <p>
              <span role="img" aria-label="pencil">✏️ </span> In-built pattern-editor
            </p>
            <p>
              <span role="img" aria-label="family">👨‍👩‍👧‍👦</span> Join a growing community of weavers and makers
            </p>
            <p>
              <span role="img" aria-label="map">🗺️</span> Contribute to the roadmap as we develop
            </p>
            <h4>And lots more coming soon!</h4>

            <h2 id='why-free'>How is {utils.appName()} free?</h2>
            <p>{utils.appName()} was built in order to help family weavers organise, store, and share their weaving projects, as well as plan and design new patterns. We thought that all of this could be useful to other people too!</p>
            <p>{utils.appName()} is built on modern and low-cost technologies that are not too expensive to maintain. We may eventually add in additional paid-for features to help cover our costs if these grow too big. If you'd like to help us out or find out more then please <a href={`mailTo:${import.meta.env.VITE_CONTACT_EMAIL}`} target='_blank' rel='noopener noreferrer'>get in touch</a>!</p>
          </Grid.Column>

          <Grid.Column computer={6}>
            <h2>Ready to get started?</h2>
            <p>See what it's all about. Signing-up only takes a few seconds, and we'd love to hear your feedback.</p>
            <Divider hidden />
            <Button size="large" color="teal" fluid onClick={onRegisterClicked}>Join us</Button>

          </Grid.Column>
        </Grid>
      </Container>

    </div>
  );
}

export default MarketingHome;
