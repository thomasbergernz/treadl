import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Input, Message, Icon, Button, Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import RichText from 'components/includes/RichText';
import RichTextViewer from 'components/includes/RichTextViewer';
import DraftPreview from './objects/DraftPreview';
import NewFeedMessage from 'components/includes/NewFeedMessage';
import FeedMessage from 'components/includes/FeedMessage';

function ObjectViewer({ user, myProjects, project, fullProjectPath, onEditObject, onDeleteObject, object, comments, history, onReceiveComment, onDeleteComment }) {
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const objectId = object?._id;

  useEffect(() => {
    if (!objectId) return;
    api.objects.getComments(objectId, data => {
      data.comments.forEach(onReceiveComment);
    });
  }, [objectId, onReceiveComment]);

  const deleteObject = (object) => {
    utils.confirm('Delete object', 'Really delete this object? This cannot be undone.').then(() => {
      navigate(`/${fullProjectPath}`);
      api.objects.delete(object._id, () => onDeleteObject(object._id), err => toast.error(err.message));
    }, () => {});
  }

  const saveObjectName = (object) => {
    api.objects.update(object._id, { name: object.name }, () => {
      setEditingName(false);
    }, err => toast.error(err.message));
  }

  const saveObjectDescription = (object) => {
    api.objects.update(object._id, { description: object.description }, () => {
      setEditingDescription(false);
    }, err => toast.error(err.message));
  }

  const downloadWif = (object) => {
    setDownloading(true);
    api.objects.getWif(object._id, ({ wif }) => {
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(wif.replace(/\\n/g, '\n'))}`);
      element.setAttribute('download', `${object.name.replace(/ /g, '_')}.wif`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(false);
    }, err => {
      toast.error(err.message);
      setDownloading(false);
    });
  }

  const downloadDrawdownImage = (object) => {
    const element = document.createElement('a');
    element.setAttribute('href', object.preview);
    element.setAttribute('download', `${object.name.replace(/ /g, '_')}-drawdown.png`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.info('The file has been downloaded');
  }
  const downloadPatternImage = (object) => {
    const element = document.createElement('a');
    element.setAttribute('href', object.patternImage);
    element.setAttribute('download', `${object.name.replace(/ /g, '_')}-pattern.png`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.info('The file has been downloaded');
  }

  const copyPattern = (project) => {
    api.objects.copyTo(object._id, project._id, newObject => {
      window.location = `/${project.fullName}/${newObject._id}`;
    }, err => {
      toast.error(err.message);
    });
  }

  if (!object) return null;
  return (
    <>
      <Helmet title={`${object.name || 'Project Item'} | ${project?.name || 'Project'}`} />

      <span style={{float:'right'}}>
        {object.type === 'pattern' && (project.user === (user && user._id) || project.openSource || object.preview) && <>
          <Dropdown icon={null} trigger={<Button size='tiny' secondary icon='download' content='Download pattern' loading={downloading} disabled={downloading}/>}>
            <Dropdown.Menu>
              {object.preview &&
                <Dropdown.Item onClick={e => downloadDrawdownImage(object)} content='Download drawdown as an image' icon='file outline' />
              }
              {(project.user === (user && user._id) || project.openSource) &&
                <React.Fragment>
                  {object.patternImage &&
                    <Dropdown.Item icon='file outline' content='Download complete pattern as an image' onClick={e => downloadPatternImage(object)}/>
                  }
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={e => downloadWif(object)} content="Download pattern in WIF format" icon="text file" />
                </React.Fragment>
              }
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown icon={null} trigger={<Button size="small" icon="copy" secondary content="Copy to.." />}>
            <Dropdown.Menu>
              <Dropdown.Header>Select a project to copy this pattern to</Dropdown.Header>
              {myProjects?.map(myProject => <Dropdown.Item content={myProject.name} onClick={e => copyPattern(myProject)} />)}
            </Dropdown.Menu>
          </Dropdown>
        </>}

        {utils.canEditProject(user, project) &&
          <>
            {object.type === 'pattern'
              && <Button size="small" icon="pencil" primary content="Edit pattern" as={Link} to={`/${fullProjectPath}/${object._id}/edit`} />
            }
            <Dropdown
              icon={null}
              trigger=<Button size="small" icon="cogs" content="Options" />
            >
              <Dropdown.Menu>
                <Dropdown.Item onClick={e => deleteObject(object)} content="Delete" icon="trash" />
              </Dropdown.Menu>
            </Dropdown>

          </>
        }
      </span>

      {editingName ?
        <div style={{marginBottom: 5}}>
          <Input autoFocus size="small" value={object.name} style={{marginBottom: 10}}
            onChange={e => onEditObject(object._id, 'name', e.target.value)}
            action=<Button icon="check" primary onClick={e => saveObjectName(object)} />
          />
        </div>
      :
        <h3 style={{marginBottom:5}}>
          {object.name}
          {utils.canEditProject(user, project) &&
            <span style={{color:'rgb(180,180,180)', cursor: 'pointer', marginLeft: 5}} onClick={e => setEditingName(true)}><Icon name='pencil' /></span>
          }
          <br />
          <span style={{fontSize: 11, color: 'rgb(170,170,170)'}}>
            <Icon name='calendar' /> Added {moment(object.createdAt).fromNow()}
          </span>
        </h3>
      }

      <div style={{marginTop: 20, marginBottom: 20, padding: 10, border: '1px solid rgb(240,240,240)'}}>
        {object.type === 'pattern' &&
          <div style={{maxHeight: 400, overflowY: 'scroll'}}>
            <DraftPreview object={object} onImageLoaded={i => onEditObject(object._id, 'patternImage', i)}/>
          </div>
        }
        {object.isImage &&
          <img alt={`${object.name}`} src={utils.resizeUrl(object.url, 800)} style={{ maxWidth: '100%', maxHeight: 400, display: 'block', margin: '0px auto' }} />
        }
        {object.type === 'file' && !object.isImage &&
          <div style={{textAlign:'center'}}>
            <h2 style={{ margin: 20, fontSize: 50}}><Icon name={utils.getFileIcon(object.name)} /></h2>
            <Button size="small" color="blue" as="a" href={object.url} download={object.name} icon="download" content="Download" target="_blank" />
          </div>
        }
      </div>

      {editingDescription ?
        <div style={{padding: 10, border: '1px solid rgb(230,230,230)'}}>
          <RichText value={object.description} onChange={t => onEditObject(object._id, 'description', t)} />
          <Button primary size="small" icon="check" content="Save description" onClick={e => saveObjectDescription(object)} />
        </div>
      :
        <div>
          <RichTextViewer content={object.description} />
          <div style={{ marginTop: 10 }} />
          {utils.canEditProject(user, project) &&
            <Button basic primary onClick={e => setEditingDescription(true)} content={object.description ? 'Edit description' : 'Add a description'} />
          }
        </div>
      }

      <div style={{marginTop: 20}}>
        <h3>Comments
          {project?.user === user?._id && !utils.hasSubscription(user, 'projects.commented') &&
            <Button style={{marginLeft: 10}} size='mini' basic icon='envelope' content='Get notified if someone comments' as={Link} to='/settings/notifications' />
          }
        </h3>
        {user ?
          <NewFeedMessage noAttachments user={user} forType='object' object={object} onPosted={onReceiveComment} placeholder='Write a new comment...'/>
        : <Message size='small'>Please login to write your own comments.</Message>
        }
        {comments?.map(c =>
          <FeedMessage key={c._id} user={user} forType='object' object={object} post={c} replies={[]} onDeleted={onDeleteComment} />
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { username, projectPath, objectId } = ownProps.match.params;
  const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
  const objects = [];
  state.objects.objects.forEach((d) => {
    if (d.project === project._id) objects.push(d);
  });
  const object = objects.filter(o => o._id === objectId)[0];
  const comments = state.objects.comments?.filter(c => c.object === object?._id).sort((a, b) => {
    const aDate = new Date(a.createdAt);
    const bDate = new Date(b.createdAt);
    return aDate < bDate;
  });
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const myProjects = state.projects.projects.filter(p => p.owner?.username === user?.username);
  return { user, myProjects, project, objects, fullProjectPath: `${username}/${projectPath}`, object, comments };
};
const mapDispatchToProps = dispatch => ({
  onEditObject: (id, field, value) => dispatch(actions.objects.update(id, field, value)),
  onDeleteObject: id => dispatch(actions.objects.delete(id)),
  onReceiveComment: c => dispatch(actions.objects.receiveComment(c)),
  onDeleteComment: id => dispatch(actions.objects.deleteComment(id)),
});
const ObjectViewerContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(ObjectViewer);

export default ObjectViewerContainer;
