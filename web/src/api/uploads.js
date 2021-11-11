import api from 'api';

export const uploads = {
  generateFileUploadRequest({
    forType, forId, name, size, type,
  }, success, fail) {
    api.authenticatedRequest('GET', `/uploads/file/request?name=${name}&size=${size}&type=${type}&forType=${forType}&forId=${forId}`, null, success, fail);
  },
};
