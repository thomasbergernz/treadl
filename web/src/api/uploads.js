import api from '.';

export const uploads = {
  generateFileUploadRequest({
    forType, forId, name, size, type,
  }, success, fail) {
    api.authenticatedRequest('GET', `/uploads/file/request?name=${name}&size=${size}&type=${type}&forType=${forType}&forId=${forId}`, null, success, fail);
  },
  uploadFile(forType, forId, name, file, success, fail) {
    uploads.generateFileUploadRequest({
      forType, forId, name, size: file.size, type: file.type || 'image/png',
    }, (response) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', response.signedRequest);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // We pass back the original file name so it can be displayed nicely
            success && success({ storedName: response.fileName, name: file.name, type: 'file' });
          } else if (onError) {
            fail && fail({ message: 'Unable to upload file' });
          }
        }
      };
      xhr.send(file);
    }, (err) => {
      fail && fail(err);
    });
  },
};
