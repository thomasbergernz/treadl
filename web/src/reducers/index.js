import { combineReducers } from 'redux';
import app from './app.js';
import auth from './auth.js';
import users from './users.js';
import projects from './projects.js';
import objects from './objects.js';
import groups from './groups.js';
import invitations from './invitations.js';
import posts from './posts.js';

const reducers = combineReducers({ app, auth, users, projects, objects, groups, invitations, posts });

export default reducers;
