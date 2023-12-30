import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Message, Form, TextArea, Container, Button, Icon, Grid, Card, Breadcrumb } from 'semantic-ui-react';
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import utils from '../../../utils/utils.js';
import actions from '../../../actions';
import api from '../../../api';

import UserChip from '../../includes/UserChip';
import HelpLink from '../../includes/HelpLink';
import ObjectCreator from '../../includes/ObjectCreator';
import FormattedMessage from '../../includes/FormattedMessage';

function Project() {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { username, projectPath, objectId } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, project, fullName, errorMessage, editingDescription, object } = useSelector(state => {
    const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const object = state.objects.objects.filter(o => o._id === objectId)[0];
    return { user, project, object, fullName: `${username}/${projectPath}`, errorMessage: state.projects.errorMessage, editingDescription: state.projects.editingDescription };
  });

  useEffect(() => {
    dispatch(actions.projects.request());
    api.projects.get(fullName, p => dispatch(actions.projects.receiveProject(p)), err => dispatch(actions.projects.requestFailed(err)));
  }, [user, dispatch, fullName]);

  const wideBody = () => !location.pathname.toLowerCase().endsWith(fullName.toLowerCase());

  const saveDescription = () => {
    dispatch(actions.projects.editDescription(false));
    api.projects.update(fullName, { description: project.description }, p => dispatch(actions.projects.receiveProject(p)));
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
          {wideBody() && project.owner &&
            <div style={{display: 'flex', alignItems: 'center'}}>
              <UserChip user={project.owner} />
              <Breadcrumb size='large' style={{marginLeft: 20}}>
                <Breadcrumb.Section as={Link} to={`/${project.fullName}`}>{project.name}</Breadcrumb.Section>
                {location.pathname === `/${project.fullName}/settings` && <>
                  <Breadcrumb.Divider icon='right chevron' />
                  <Breadcrumb.Section>Settings</Breadcrumb.Section>
                </>}
                {object && <>
                  <Breadcrumb.Divider icon='right chevron' />
                  <Breadcrumb.Section as={Link} to={`/${project.fullName}/${object._id}`}>{object.name}</Breadcrumb.Section>
                  {location.pathname === `/${project.fullName}/${object._id}/edit` && <>
                    <Breadcrumb.Divider icon='right chevron' />
                    <Breadcrumb.Section>Edit</Breadcrumb.Section>
                  </>}
                </>}
              </Breadcrumb>
            </div>
          }

          <Grid stackable style={{marginTop: 10}}>
            { !wideBody() && (
            <Grid.Column computer={4} tablet={6}>
              <Card fluid raised>
                <Card.Content>
                  <Card.Header style={{ marginBottom: 10 }}>
                    {project.visibility === 'private' && <span data-tooltip="This project is private" data-position="right center"><Icon name="lock" /></span>}
                    {project.name}
                  </Card.Header>
                  <div>
                    {project.owner && <UserChip user={project.owner} />}
                  </div>
                </Card.Content>
                <Card.Content extra>
                  {editingDescription
                    ? (
                      <Form>
                        <TextArea style={{ marginBottom: '5px' }} placeholder="Describe this project..." value={project.description} onChange={e => dispatch(actions.projects.updateProject(project._id, { description: e.target.value }))} />
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
                          <Button style={{ marginBottom: '5px' }} size='mini' fluid onClick={e => dispatch(actions.projects.editDescription(true))}>
                            <Icon name="pencil" /> {project.description ? 'Edit' : 'Add a project'} description
                          </Button>
                          )
                        }
                        {utils.canEditProject(user, project) &&
                          <Button basic fluid size='mini' icon='cogs' content='Project settings' as={Link} to={`/${fullName}/settings`} />
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
              
              {(import.meta.env.VITE_IOS_APP_URL || import.meta.env.VITE_ANDROID_APP_URL) && user?._id === project.user &&
                <Card fluid style={{opacity: 0.75}}>
                  <Card.Content>
                    <Card.Header>Take photos on your phone?</Card.Header>
                    <p style={{marginTop: 5}}>You can use the {import.meta.env.VITE_APP_NAME} app to upload images directly to your projects.</p>
                    <h4 style={{marginTop: 15}}><Icon name='download' /> Download for</h4>
                    <Button.Group fluid basic size='tiny'>
                      {import.meta.env.VITE_IOS_APP_URL &&
                        <Button as='a' href={import.meta.env.VITE_IOS_APP_URL} target='_blank' rel='noopener noreferrer'><Icon name='apple' /> iOS</Button>
                      }
                      {import.meta.env.VITE_ANDROID_APP_URL &&
                        <Button as='a' href={import.meta.env.VITE_ANDROID_APP_URL} target='_blank' rel='noopener noreferrer'><Icon name='android' /> Android</Button>
                      }
                    </Button.Group>
                  </Card.Content>
                </Card>
              }

              <HelpLink link={`/docs/projects`} />
            </Grid.Column>
            )}

            <Grid.Column computer={wideBody() ? 16 : 12} tablet={wideBody() ? 16 : 10}>
              {project && <Outlet />}
            </Grid.Column>
          </Grid>

        </div>
        )
      }

    </Container>
  );
}

export default Project;
