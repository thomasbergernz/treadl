import React, { useState, useRef } from 'react';
import { Button } from 'semantic-ui-react';
import api from '../../api';

function FileChooser({ onUploadStart, onUploadFinish, onError, onComplete, content, trigger, accept, forType, forObject }) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef();

  const startUpload = () => {
    setIsUploading(true);
    onUploadStart && onUploadStart();
  };

  const finishUpload = () => {
    setIsUploading(false);
    onUploadFinish && onUploadFinish();
  };

  const chooseFile = () => inputRef.current.click();

  const handleFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      startUpload();
      const fileName = file.name.replace(/[^a-zA-Z0-9_.]/g, '_');
      if (forType === 'project' && fileName.toLowerCase().indexOf('.wif') > -1) {
        const reader = new FileReader();
        reader.onload = (e2) => {
          finishUpload();
          onComplete({ wif: e2.target.result, type: 'pattern' });
        };
        reader.readAsText(file);
      } else {
        api.uploads.generateFileUploadRequest({
          forType: forType, forId: forObject._id, name: fileName, size: file.size, type: file.type,
        }, async (response) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', response.signedRequest);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              finishUpload();
              if (xhr.status === 200) {
                // We pass back the original file name so it can be displayed nicely
                onComplete({ storedName: response.fileName, name: file.name, type: 'file' });
              } else if (onError) {
                finishUpload();
                onError('Unable to upload file');
              }
            }
          };
          xhr.send(file);
        }, (err) => {
          finishUpload();
          if (onError) onError(err.message || 'Unable to upload file');
        });
      }
    }
  }

  return (
    <React.Fragment>
      <input type="file" style={{ display: 'none' }} ref={inputRef} onChange={handleFileChosen} accept={accept || '*'} />
      {trigger
        ? React.cloneElement(trigger, { loading: isUploading, onClick: chooseFile })
        : <Button size="small" color="blue" icon="file" fluid content={content || 'Choose a file'} loading={isUploading} onClick={chooseFile} />
      }
    </React.Fragment>
  );
}

export default FileChooser;
