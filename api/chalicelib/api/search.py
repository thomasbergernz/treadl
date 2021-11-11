import re
import pymongo
from chalicelib.util import database, util
from chalicelib.api import uploads

def all(user, params):
  if not params or 'query' not in params: raise util.errors.BadRequest('Username parameter needed')
  expression = re.compile(params['query'], re.IGNORECASE)
  db = database.get_db()

  users = list(db.users.find({'username': expression}, {'username': 1, 'avatar': 1}).limit(10).sort('username', pymongo.ASCENDING))
  for u in users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
  
  projects = list(db.projects.find({'name': expression, '$or': [
    {'user': user['_id']},
    {'groupVisibility': {'$in': user.get('groups', [])}},
    {'visibility': 'public'}
    ]}, {'name': 1, 'path': 1, 'user': 1}).limit(5))
  proj_users = list(db.users.find({'_id': {'$in': list(map(lambda p:p['user'], projects))}}, {'username': 1, 'avatar': 1}))
  for proj in projects:
    for proj_user in proj_users:
      if proj['user'] == proj_user['_id']:
        proj['owner'] = proj_user
        proj['fullName'] = proj_user['username'] + '/' + proj['path']
        if 'avatar' in proj_user:
          proj['owner']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(proj_user['_id'], proj_user['avatar']))

  groups = list(db.groups.find({'name': expression, 'unlisted': {'$ne': True}}, {'name': 1, 'closed': 1}).limit(5))

  return {'users': users, 'projects': projects, 'groups': groups}

def users(user, params):
  if not params or 'username' not in params: raise util.errors.BadRequest('Username parameter needed')
  expression = re.compile(params['username'], re.IGNORECASE)
  db = database.get_db()
  users = list(db.users.find({'username': expression}, {'username': 1, 'avatar': 1}).limit(5).sort('username', pymongo.ASCENDING))
  for u in users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
  return {'users': users}
