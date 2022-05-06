import React, { useState, useEffect } from 'react';
import { Segment, Label, Input, Icon, Card, Loader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import ObjectCreator from 'components/includes/ObjectCreator';
import logoGreyShort from 'images/logo/grey_short.png';
import FolderImage from 'images/folder.png';

const CompactObject = styled(Link)`
  display:flex;
  align-items:center;
  padding-bottom: 5px;
  padding-top: 5px;
  background-color: ${props => props.selected ? 'rgb(240,240,240)' : 'none'};
  &:hover{
    background-color: rgb(250,250,250);
  }
`;

function ObjectList({ user, objects, currentObject, project, fullProjectPath, onReceiveObjects, compact }) {
  const [loading, setLoading] = useState(false);
  const [objectFilter, setObjectFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.projects.getObjects(fullProjectPath, projects => {
      onReceiveObjects(projects);
      setLoading(false);
    }, err => setLoading(false));
  }, [fullProjectPath, onReceiveObjects]);

  let filteredObjects = objects;
  if (objectFilter) {
    const exp = new RegExp(objectFilter, 'i');
    filteredObjects = objects?.filter(o => o.name.match(exp));
  }

  return (
    <div>
      {loading && !objects.length &&
        <div style={{textAlign: 'center'}}>
          <h4>Opening project...</h4>
          <Loader active inline="centered" />
        </div>
      }
      {!loading && !objects.length &&
        (utils.canEditProject(user, project) ?
          <Segment placeholder textAlign='center'>
            <h2>Welcome to your project</h2>
            <img src={FolderImage} style={{maxWidth:200, display:'block', margin: '0px auto'}} alt='Empty project' />
            <h3>This project is currently empty</h3>
            <div style={{maxWidth: 300, margin:'0px auto'}}>
              <p>You can now add something by creating a new pattern draft, importing an existing pattern in the WIF file format, or uploading any other type of file.</p>
              <ObjectCreator project={project} />
            </div>
          </Segment>
        :
          <Segment placeholder textAlign='center'>
            <h2>Welcome</h2>
            <img src={FolderImage} style={{maxWidth:200, display:'block', margin: '0px auto'}} alt='Empty project' />
            <h3>This project is currently empty</h3> <p>Come back soon!</p>
          </Segment>
        )
      }
      {objects.length > 0 &&
        (compact ?
          <div>
            <Input value={objectFilter} onChange={e => setObjectFilter(e.target.value)} size='small' fluid transparent icon='search' iconPosition='left' placeholder='Search project...' style={{marginBottom: 15}} />
            {!filteredObjects?.length &&
              <div style={{textAlign:'center', color:'rgb(150,150,150)'}}>
                <p>We couldn't find what you're searching for</p>
              </div>
            }
            {filteredObjects.map(object =>
              <CompactObject to={`/${fullProjectPath}/${object._id}`} key={object._id} selected={currentObject?._id === object._id}>
                {object.type === 'file' && !object.isImage &&
                  <div style={{width:40, textAlign:'center'}}><Icon name={utils.getFileIcon(object.name)} size='large' verticalAlign='middle' /></div>
                }
                {object.isImage &&
                  <div style={{width:40, height:40, backgroundImage:`url(${utils.resizeUrl(object.url, 50)})`, backgroundSize:'cover', backgroundPosition:'center center'}} />
                }
                {object.type === 'pattern' && (object.preview
                  ? (
                    <div style={{ height: 40, width:40, backgroundImage: `url(${object.preview})`, backgroundSize: 'cover', backgroundPosition: 'top right' }}
                    />
                  )
                  : <div style={{ height: 40, width:40, backgroundImage: `url(${logoGreyShort})`, backgroundSize: '50px' }} />
                )}
                <div style={{flex: 1, marginLeft: 5}}>
                  <h3 style={{fontSize: 13, marginBottom: 0}}>{object.name}</h3>
                  <Label size='mini' rounded>
                    {object.type === 'pattern' && <><Icon name='pencil' /> WIF pattern</>}
                    {object.type === 'file' &&
                      (object.isImage ? <><Icon name='image' /> Image</> : <><Icon name='file outline' /> File</>)
                    }
                  </Label>
                  {object?.description?.length > 0 && <Label data-tooltip='Description available' size='mini' rounded color='blue' icon='align left' style={{marginLeft: 5}} />}
                  {object?.commentCount > 0 && <Label data-tooltip='Comments' size='mini' rounded color='olive' icon='comments' content={object.commentCount} style={{marginLeft: 5}} />}
                </div>
              </CompactObject>
            )}
            {utils.canEditProject(user, project) &&
              <div style={{marginTop: 10}}>
                <ObjectCreator project={project} fluid />
              </div>
            }
          </div>
      :
        <>
          <div style={{marginBottom: 10}}>
            <Input value={objectFilter} onChange={e => setObjectFilter(e.target.value)} size='small' fluid transparent icon='search' iconPosition='left' placeholder='Search project...' style={{marginBottom: 15}} />
          </div>
          {!filteredObjects?.length &&
            <Segment placeholder textAlign='center'>
              <h2>We couldn't find what you're looking for</h2>
              <p>Change your search term and try again.</p>
            </Segment>
          }
          <Card.Group stackable doubling itemsPerRow={4}>
            {filteredObjects.map((object, index) => (
              <Card raised key={object._id} style={{ cursor: 'pointer' }} as={Link} to={`/${fullProjectPath}/${object._id}`}>
                {object.type === 'pattern'
                && (object.preview
                  ? (
                    <div style={{ height: 200, backgroundImage: `url(${object.preview})`, backgroundSize: 'cover', backgroundPosition: 'top right' }}
                    />
                  )
                  : <div style={{ height: 200, backgroundImage: `url(${logoGreyShort})`, backgroundSize: '50px' }} />
                )
              }
                {object.type === 'file'
                && (object.isImage
                  ? (
                    <div style={{ height: 200, backgroundImage: `url(${utils.resizeUrl(object.url, 200)})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} />
                  )
                  : (
                    <div style={{ height: 200, textAlign: 'center' }}>
                      <h2 style={{ marginTop: 20, fontSize: 50 }}><Icon name={utils.getFileIcon(object.name)} /></h2>
                    </div>
                  )
                )
              }
                <Card.Content>
                  <Card.Header style={{ wordBreak: 'break-all' }}>{object.name}</Card.Header>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </>
      )}
    </div>
  );
}


const mapStateToProps = (state, ownProps) => {
  const { username, projectPath, objectId } = ownProps.match.params;
  const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
  const objects = [];
  let currentObject;
  state.objects.objects.forEach((d) => {
    if (d.project === project._id) objects.push(d);
    if (d._id === objectId) currentObject = d;
  });
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user, project, objects, currentObject, fullProjectPath: `${username}/${projectPath}` };
};
const mapDispatchToProps = dispatch => ({
  onReceiveObjects: objects => dispatch(actions.objects.receiveMultiple(objects)),
  onEditObject: (id, field, value) => dispatch(actions.objects.update(id, field, value)),
  onDeleteObject: id => dispatch(actions.objects.delete(id)),
});
const ObjectListContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(ObjectList);

export default ObjectListContainer;
