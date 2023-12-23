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
      
  my_projects = list(db.projects.find({'user': user['_id']}, {'name': 1, 'path': 1}))
  objects = list(db.objects.find({'project': {'$in': list(map(lambda p: p['_id'], my_projects))}, 'name': expression}, {'name': 1, 'type': 1, 'isImage': 1, 'project': 1}))
  for o in objects:
    proj = next(p for p in my_projects if p['_id'] == o['project'])
    if proj:
      o['path'] = user['username'] + '/' + proj['path'] + '/' + str(o['_id'])
  
  projects = list(db.projects.find({'name': expression, '$or': [
    {'user': user['_id']},
    {'groupVisibility': {'$in': user.get('groups', [])}},
    {'visibility': 'public'}
    ]}, {'name': 1, 'path': 1, 'user': 1}).limit(10))
  proj_users = list(db.users.find({'_id': {'$in': list(map(lambda p:p['user'], projects))}}, {'username': 1, 'avatar': 1}))
  for proj in projects:
    for proj_user in proj_users:
      if proj['user'] == proj_user['_id']:
        proj['owner'] = proj_user
        proj['fullName'] = proj_user['username'] + '/' + proj['path']
        if 'avatar' in proj_user:
          proj['owner']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(proj_user['_id'], proj_user['avatar']))

  groups = list(db.groups.find({'name': expression, 'unlisted': {'$ne': True}}, {'name': 1, 'closed': 1}).limit(5))

  return {'users': users, 'projects': projects, 'groups': groups, 'objects': objects}

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

def discover(user, count = 3):
  db = database.get_db()
  projects = []
  users = []

  all_projects_query = {'name': {'$not': re.compile('my new project', re.IGNORECASE)}, 'visibility': 'public'}
  if user and user.get('_id'):
    all_projects_query['user'] = {'$ne': user['_id']}
  all_projects = list(db.projects.find(all_projects_query, {'name': 1, 'path': 1, 'user': 1}))
  random.shuffle(all_projects)
  for p in all_projects:
    if db.objects.find_one({'project': p['_id'], 'name': {'$ne': 'Untitled pattern'}}):
      owner = db.users.find_one({'_id': p['user']}, {'username': 1})
      p['fullName'] = owner['username'] + '/' + p['path']
      projects.append(p)
    if len(projects) >= count: break

  interest_fields = ['bio', 'avatar', 'website', 'facebook', 'twitter', 'instagram', 'location']
  all_users_query = {'$or': list(map(lambda f: {f: {'$exists': True}}, interest_fields))}
  if user and user.get('_id'):
    all_users_query['_id'] = {'$ne': user['_id']}
  all_users = list(db.users.find(all_users_query, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}))
  random.shuffle(all_users)
  for u in all_users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
    if user:
      u['following'] = u['_id'] in list(map(lambda f: f['user'], user.get('following', [])))
    users.append(u)
    if len(users) >= count: break

  return {
    'highlightProjects': projects,
    'highlightUsers': users,
  }

def explore(page = 1):
  db = database.get_db()
  per_page = 10
  
  project_map = {}
  user_map = {}
  all_public_projects = list(db.projects.find({'name': {'$not': re.compile('my new project', re.IGNORECASE)}, 'visibility': 'public'}, {'name': 1, 'path': 1, 'user': 1}))
  all_public_project_ids = list(map(lambda p: p['_id'], all_public_projects))
  for project in all_public_projects:
    project_map[project['_id']] = project
  objects = list(db.objects.find({'project': {'$in': all_public_project_ids}, 'name': {'$not': re.compile('untitled pattern', re.IGNORECASE)}, 'preview': {'$exists': True}}, {'project': 1, 'name': 1, 'createdAt': 1, 'preview': 1}).sort('createdAt', pymongo.DESCENDING).skip((page - 1) * per_page).limit(per_page))
  for object in objects:
    object['projectObject'] = project_map.get(object['project'])
    if 'preview' in object and '.png' in object['preview']:
      object['previewUrl'] = uploads.get_presigned_url('projects/{0}/{1}'.format(object['project'], object['preview']))
      del object['preview']
  authors = list(db.users.find({'_id': {'$in': list(map(lambda o: o.get('projectObject', {}).get('user'), objects))}}, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}))
  for a in authors:
    if 'avatar' in a:
      a['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(a['_id'], a['avatar']))
    user_map[a['_id']] = a
  for object in objects:
    object['userObject'] = user_map.get(object.get('projectObject', {}).get('user'))
        
  return {'objects': objects}
  