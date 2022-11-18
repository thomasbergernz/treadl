import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import actions from '../../actions';
import api from '../../api';

import FileChooser from './FileChooser';

function ObjectCreator({ project, onCreateObject, onError, fluid }) {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const createNewPattern = () => {
    api.projects.createObject(project.fullName, { name: 'Untitled pattern', type: 'pattern' }, (object) => {
      dispatch(actions.objects.create(object));
      navigate(`/${project.fullName}/${object._id}/edit`);
    });
  };

  const fileUploaded = (file) => {
    setIsUploading(true);
    api.projects.createObject(project.fullName, {
      name: file.name, storedName: file.storedName, type: file.type, wif: file.wif,
    }, (object) => {
      setIsUploading(false);
      dispatch(actions.objects.create(object));
      navigate(`/${project.fullName}/${object._id}`);
    }, (err) => {
      toast.error(err.message);
      setIsUploading(false);
      onError && onError(err);
    });
  };

  return (
    <Dropdown
      fluid={!!fluid}
      icon={null}
      trigger={<Button color="teal" fluid content="Add something" icon="plus" loading={isUploading} />}
    >
      <Dropdown.Menu>
        <Dropdown.Item onClick={createNewPattern} icon="pencil" content="Create a new weaving pattern" />
        <FileChooser
          forType="project"
          forObject={project}
          trigger={<Dropdown.Item icon="upload" content="Import a WIF file" />}
          accept=".wif"
          onUploadStart={e => setIsUploading(true)}
          onUploadFinish={e => setIsUploading(false)}
          onComplete={fileUploaded}
        />
        <FileChooser
          forType="project"
          forObject={project}
          trigger={<Dropdown.Item icon="cloud upload" content="Upload an image or a file" />}
          onUploadStart={e => setIsUploading(true)}
          onUploadFinish={e => setIsUploading(false)}
          onComplete={fileUploaded}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ObjectCreator;
