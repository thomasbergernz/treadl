import { createConfirmation } from 'react-confirm';
import ConfirmModal from '../components/includes/ConfirmModal';
import api from '../api';

import avatar1 from '../images/avatars/1.png';
import avatar2 from '../images/avatars/2.png';
import avatar3 from '../images/avatars/3.png';
import avatar4 from '../images/avatars/4.png';
import avatar5 from '../images/avatars/5.png';
import avatar6 from '../images/avatars/6.png';
import avatar7 from '../images/avatars/7.png';
import avatar8 from '../images/avatars/8.png';
import avatar9 from '../images/avatars/9.png';
import avatar10 from '../images/avatars/10.png';

const IMAGE_SERVER = import.meta.env.VITE_IMAGINARY_URL;

const utils = {
  appName() {
    return import.meta.env.VITE_APP_NAME;
  },
  hasSubscription(user, key) {
    return user?.subscriptions?.email?.indexOf(key) > -1;
  },
  canEditProject(user, project) {
    return user && project && user._id === project.user;
  },
  isInGroup(user, groupId) {
    return user && user.groups && user.groups.indexOf(groupId) > -1;
  },
  isGroupAdmin(user, group) {
    return group?.admins?.indexOf(user?._id) > -1 || user?.roles?.indexOf('root') > -1;
  },
  ensureHttp(s) {
    if (s && s.toLowerCase().indexOf('http') === -1) return `http://${s}`;
    return s;
  },
  activePath(pattern) {
    const match = window.location.pathname.match(new RegExp(pattern, 'i'));
    return match && match.length > 0;
  },
  absoluteUrl(path) {
    return window.location.protocol + '//' + window.location.host + path;
  },
  avatarUrl(user) {
    const avatar = user?.avatar;
    if (avatar?.length < 3) {
      const a = utils.defaultAvatars().filter(a => a.key === avatar)[0];
      return a && a.url;
    }
    return user.avatarUrl;
  },
  defaultAvatars() {
    return [
      { key: '1', url: avatar1 },
      { key: '2', url: avatar2 },
      { key: '3', url: avatar3 },
      { key: '4', url: avatar4 },
      { key: '5', url: avatar5 },
      { key: '6', url: avatar6 },
      { key: '7', url: avatar7 },
      { key: '8', url: avatar8 },
      { key: '9', url: avatar9 },
      { key: '10', url: avatar10 },
    ];
  },
  hasEmailSubscription(user, sub) {
    return user && user.subscriptions && user.subscriptions.email && user.subscriptions.email.indexOf(sub) > -1;
  },
  confirm(title, content) {
    const confirm = createConfirmation(ConfirmModal);
    return confirm({ title, confirmation: content });
  },
  rgb(s) {
    if (s.match(/^[0-9]+,[0-9]+,[0-9]+$/)) return `rgb(${s})`;
    if (s.match(/^rgb\([0-9]+,[0-9]+[0-9]+\)$/)) return s;
    if (s.match(/^#[a-zA-Z0-9]+$/)) {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const hex = s.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (r) return `rgb(${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)})`;
    }
    return null;
  },
  getFileIcon(n) {
    if (!n) return null;
    const name = n.toLowerCase();
    let ext = '';
    if (name.indexOf('.pdf') > -1) ext = 'pdf outline';
    if (name.indexOf('.doc') > -1) ext = 'word outline';
    if (name.indexOf('.ppt') > -1) ext = 'powerpoint outline';
    if (name.indexOf('.xls') > -1) ext = 'excel outline';
    if (name.indexOf('.txt') > -1) ext = 'alternate outline';
    if (name.indexOf('.mov') > -1 || name.indexOf('mp4') > -1) ext = 'video outline';
    return `file ${ext || 'outline'}`;
  },
  cropUrl(url, width, height) {
    if (url?.indexOf('http') !== 0) return url;
    if (IMAGE_SERVER) return `${import.meta.env.VITE_IMAGINARY_URL}/crop?width=${width}&height=${height}&url=${url}`;
    return url;
  },
  resizeUrl(url, width) {
    if (url?.indexOf('http') !== 0) return url;
    if (IMAGE_SERVER) return `${import.meta.env.VITE_IMAGINARY_URL}/resize?width=${width}&url=${url}`;
    return url;
  },
  generatePatternPreview(object, callback) {
    const c = document.getElementsByClassName('drawdown')[0];
    c?.toBlob(blob => {
      if (blob) {
        api.uploads.uploadFile('project', object.project, `preview-${object._id}.png`, blob, response => {
          api.objects.update(object._id, { preview: response.storedName }, ({ previewUrl }) => {
            callback && callback(previewUrl);
          });
        });
      }
    });
  }
};

export default utils;
