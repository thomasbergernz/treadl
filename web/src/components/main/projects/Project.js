import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Message, Form, TextArea, Container, Button, Icon, Grid, Card } from 'semantic-ui-react';
import { Routes, Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import UserChip from 'components/includes/UserChip';
import HelpLink from 'components/includes/HelpLink';
import ObjectCreator from 'components/includes/ObjectCreator';
import FormattedMessage from 'components/includes/FormattedMessage';
import Draft from './objects/Draft.js';
import ObjectList from './ObjectList.js';
import ProjectObjects from './ProjectObjects.js';
import ProjectSettings from './Settings.js';

function Project({ user, project, fullName, errorMessage, editingDescription, onUpdateProject, onReceiveProject, onEditDescription, onRequest, onRequestFailed, match, history }) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    onRequest();
    api.projects.get(fullName, onReceiveProject, onRequestFailed);
  }, [user, onRequest, fullName, onReceiveProject, onRequestFailed]);

  const wideBody = () => !match.isExact

  const saveDescription = () => {
    onEditDescription(false);
    api.projects.update(fullName, { description: project.description }, onReceiveProject);
  }

  const getDescription = () => {
    const desc = project?.description;
    if (!desc || desc.length < 250 || descriptionExpanded) return desc;
    if (desc.length < 250) return desc;
    return desc.substring(0, 247) + '...';
  }

  return (
    <Container fluid style={{ marginTop: '40px', padding: '0px 20px' }}>
      <Helmet title={project?.name || 'Project'} />
      {errorMessage && (
      <Message>
        <p><strong>There was a problem finding this page.</strong></p>
        <p>{errorMessage}</p>
      </Message>
      )}
      {project
        && (
        <div>
          {history.location?.state?.prevPath &&
            <div style={{marginBottom:15}}>
              <Button basic secondary onClick={e => history.goBack()} icon='arrow left' content='Go back' />
            </div>
          }

          {wideBody() && project.owner &&
            <>
              <h3 style={{ marginBottom: 0 }}>
                {project.name}
                <Button as={Link} size='tiny' style={{marginLeft: 10}} to={`/${project.fullName}`} basic secondary icon='arrow left' content='Back to project' />
              </h3>
              <UserChip user={project.owner} />
            </>
          }

          <Grid stackable style={{marginTop: 30}}>
            { !wideBody() && (
            <Grid.Column computer={4} tablet={6}>
              <Card fluid>
                <Card.Content>
                  <Card.Header style={{ marginBottom: 10 }}>
                    {project.visibility === 'private' && <span data-tooltip="This project is private"><Icon name="lock" /></span>}
                    {project.name}
                  </Card.Header>
                  {project.owner && <UserChip user={project.owner} />}
                  {utils.canEditProject(user, project) &&
                    <Button style={{float:'right'}} basic size='mini' icon='cogs' content='Settings' as={Link} to={`/${fullName}/settings`} />
                  }

                </Card.Content>
                <Card.Content extra>
                  {editingDescription
                    ? (
                      <Form>
                        <TextArea style={{ marginBottom: '5px' }} placeholder="Describe this project..." value={project.description} onChange={e => onUpdateProject(project._id, { description: e.target.value })} />
                        <Button size="tiny" color="green" fluid onClick={saveDescription}>Save description</Button>
                      </Form>
                    )
                    : (
                      <div>
                        {project.description &&
                          <div style={{marginBottom:10, whiteSpace: 'pre-line'}}>
                            <FormattedMessage content={getDescription()} />
                            {project.description.length > (getDescription().length + 3) &&
                              <Button basic fluid size='mini' icon='caret down' content='View entire description' onClick={e => setDescriptionExpanded(true)}/>
                            }
                          </div>
                        }
                        {utils.canEditProject(user, project) && (
                          <Button size='mini' fluid className="right floated" onClick={e => onEditDescription(true)}>
                            <Icon name="pencil" /> {project.description ? 'Edit' : 'Add a project'} description
                          </Button>
                          )
                        }
                      </div>
                    )
                  }
                </Card.Content>
                {utils.canEditProject(user, project) &&
                  <Card.Content>
                    <ObjectCreator project={project} fluid />
                  </Card.Content>
                }
              </Card>

              <HelpLink link={`${process.env.REACT_APP_SUPPORT_ROOT}Projects`} />
            </Grid.Column>
            )}

            <Grid.Column computer={wideBody() ? 16 : 12} tablet={wideBody() ? 16 : 10}>
              {project && (
                <Routes>
                  <Route path="/:username/:projectPath/settings" element={<ProjectSettings />} />
                  <Route path="/:username/:projectPath/:objectId/edit" element={<Draft />} />
                  <Route path="/:username/:projectPath/:objectId" element={<ProjectObjects />} />
                  <Route path="/:username/:projectPath" element={<ObjectList />} />
                </Routes>
              ) }
            </Grid.Column>
          </Grid>

        </div>
        )
      }

    </Container>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { username, projectPath } = ownProps.match.params;
  const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user, project, fullName: `${username}/${projectPath}`, loading: state.projects.loading, errorMessage: state.projects.errorMessage, editingDescription: state.projects.editingDescription };
};
const mapDispatchToProps = dispatch => ({
  onRequest: () => dispatch(actions.projects.request()),
  onRequestFailed: err => dispatch(actions.projects.requestFailed(err)),
  onEditDescription: e => dispatch(actions.projects.editDescription(e)),
  onReceiveProject: project => dispatch(actions.projects.receiveProject(project)),
  onSelectObject: id => dispatch(actions.objects.select(id)),
  onUpdateProject: (id, update) => dispatch(actions.projects.updateProject(id, update)),
});
const ProjectContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(Project);

export default ProjectContainer;
