import re, random
import pymongo
from util import database, util
from api import uploads

def all(user, params):
  if not params or 'query' not in params: raise util.errors.BadRequest('Username parameter needed')
  expression = re.compile(params['query'], re.IGNORECASE)
  db = database.get_db()

  users = list(db.users.find({'username': expression}, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}).limit(10).sort('username', pymongo.ASCENDING))
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
  if not user: raise util.errors.Forbidden('You need to be logged in')
  if not params or 'username' not in params: raise util.errors.BadRequest('Username parameter needed')
  expression = re.compile(params['username'], re.IGNORECASE)
  db = database.get_db()
  users = list(db.users.find({'username': expression}, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}).limit(5).sort('username', pymongo.ASCENDING))
  for u in users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
  return {'users': users}

def discover(user):
  if not user: raise util.errors.Forbidden('You need to be logged in')

  db = database.get_db()
  projects = []
  users = []
  count = 3

  all_projects = list(db.projects.find({'name': {'$not': re.compile('my new project', re.IGNORECASE)}, 'visibility': 'public', 'user': {'$ne': user['_id']}}, {'name': 1, 'path': 1, 'user': 1}))
  random.shuffle(all_projects)
  for p in all_projects:
    if db.objects.find_one({'project': p['_id'], 'name': {'$ne': 'Untitled pattern'}}):
      owner = db.users.find_one({'_id': p['user']}, {'username': 1})
      p['fullName'] = owner['username'] + '/' + p['path']
      projects.append(p)
    if len(projects) >= count: break

  interest_fields = ['bio', 'avatar', 'website', 'facebook', 'twitter', 'instagram', 'location']
  all_users = list(db.users.find({'_id': {'$ne': user['_id']}, '$or': list(map(lambda f: {f: {'$exists': True}}, interest_fields))}, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}))
  random.shuffle(all_users)
  for u in all_users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
    users.append(u)
    if len(users) >= count: break

  return {
    'highlightProjects': projects,
    'highlightUsers': users,
  }
