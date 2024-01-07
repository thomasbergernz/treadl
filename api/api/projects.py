import datetime, re
from bson.objectid import ObjectId
from util import database, wif, util
from api import uploads, objects

default_pattern = {
  'warp': {
    'shafts': 8,
    'threading': [{'shaft': 0}] * 100,
    'defaultColour': '178,53,111',
    'defaultSpacing': 1,
    'defaultThickness': 1,
  },
  'weft': {
    'treadles': 8,
    'treadling': [{'treadle': 0}] * 50,
    'defaultColour': '53,69,178',
    'defaultSpacing': 1,
    'defaultThickness': 1
  },
  'tieups': [[]] * 8,
  'colours': ['256,256,256', '0,0,0', '50,0,256', '0,68,256', '0,256,256', '0,256,0', '119,256,0', '256,256,0', '256,136,0', '256,0,0', '256,0,153', '204,0,256', '132,102,256', '102,155,256', '102,256,256', '102,256,102', '201,256,102', '256,256,102', '256,173,102', '256,102,102', '256,102,194', '224,102,256', '31,0,153', '0,41,153', '0,153,153', '0,153,0', '71,153,0', '153,153,0', '153,82,0', '153,0,0', '153,0,92', '122,0,153', '94,68,204', '68,102,204', '68,204,204', '68,204,68', '153,204,68', '204,204,68', '204,136,68', '204,68,68', '204,68,153', '170,68,204', '37,0,204', '0,50,204', '0,204,204', '0,204,0', '89,204,0', '204,204,0', '204,102,0', '204,0,0', '204,0,115', '153,0,204', '168,136,256', '136,170,256', '136,256,256', '136,256,136', '230,256,136', '256,256,136', '256,178,136', '256,136,136', '256,136,204', '240,136,256', '49,34,238', '34,68,238', '34,238,238', '34,238,34', '71,238,34', '238,238,34', '238,82,34', '238,34,34', '238,34,92', '122,34,238', '128,102,238', '102,136,238', '102,238,238', '102,238,102', '187,238,102', '238,238,102', '238,170,102', '238,102,102', '238,102,187', '204,102,238', '178,53,111', '53,69,178'],
}

def derive_path(name):
  path = name.replace(' ', '-').lower()
  return re.sub('[^0-9a-z\-]+', '', path)

def get_by_username(username, project_path):
  db = database.get_db()
  owner = db.users.find_one({'username': username}, {'_id': 1, 'username': 1})
  if not owner:
    raise util.errors.BadRequest('User not found')
  project = db.projects.find_one({'user': owner['_id'], 'path': project_path})
  if not project:
    raise util.errors.NotFound('Project not found')
  project['owner'] = owner
  project['fullName'] = owner['username'] + '/' + project['path']
  return project

def create(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  name = data.get('name', '')
  if len(name) < 3: raise util.errors.BadRequest('A longer name is required')
  db = database.get_db()

  path = derive_path(name)
  if db.projects.find_one({'user': user['_id'], 'path': path}, {'_id': 1}):
    raise util.errors.BadRequest('Bad Name')
  groups = data.get('groupVisibility', [])
  group_visibility = []
  for group in groups:
    group_visibility.append(ObjectId(group))
  proj = {
    'name': name,
    'description': data.get('description', ''),
    'visibility': data.get('visibility', 'public'),
    'openSource': data.get('openSource', True),
    'groupVisibility': group_visibility,
    'path': path,
    'user': user['_id'],
    'createdAt': datetime.datetime.now()
  }
  result = db.projects.insert_one(proj)
  proj['_id'] = result.inserted_id
  proj['owner'] = {'_id': user['_id'], 'username': user['username']}
  proj['fullName'] = user['username'] + '/' + proj['path']
  return proj

def get(user, username, path):
  db = database.get_db()
  owner = db.users.find_one({'username': username}, {'_id': 1, 'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1})
  if not owner: raise util.errors.NotFound('User not found')
  project = db.projects.find_one({'user': owner['_id'], 'path': path})
  if not project: raise util.errors.NotFound('Project not found')
  if not util.can_view_project(user, project):
    raise util.errors.Forbidden('This project is private')

  if 'avatar' in owner:
    owner['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(owner['_id'], owner['avatar']))
  project['owner'] = owner
  project['fullName'] = owner['username'] + '/' + project['path']
  return project

def update(user, username, project_path, update):
  db = database.get_db()
  project = get_by_username(username, project_path)
  if not util.can_edit_project(user, project): raise util.errors.Forbidden('Forbidden')

  current_path = project_path
  if 'name' in update:
    if len(update['name']) < 3: raise util.errors.BadRequest('The name is too short.')
    path = derive_path(update['name'])
    if db.projects.find_one({'user': user['_id'], 'path': path}, {'_id': 1}):
      raise util.errors.BadRequest('You already have a project with a similar name')
    update['path'] = path
    current_path = path
  update['groupVisibility'] = list(map(lambda g: ObjectId(g), update.get('groupVisibility', [])))
  allowed_keys = ['name', 'description', 'path', 'visibility', 'openSource', 'groupVisibility']
  updater = util.build_updater(update, allowed_keys)
  if updater:
    db.projects.update({'_id': project['_id']}, updater)
  return get(user, username, current_path)

def delete(user, username, project_path):
  db = database.get_db()
  project = get_by_username(username, project_path)
  if not util.can_edit_project(user, project):
    raise util.errors.Forbidden('Forbidden')
  db.projects.remove({'_id': project['_id']})
  db.objects.remove({'project': project['_id']})
  return {'deletedProject': project['_id'] }

def get_objects(user, username, path):
  db = database.get_db()
  project = get_by_username(username, path)
  if not project: raise util.errors.NotFound('Project not found')
  if not util.can_view_project(user, project):
    raise util.errors.Forbidden('This project is private')

  objs = list(db.objects.find({'project': project['_id']}, {'createdAt': 1, 'name': 1, 'description': 1, 'project': 1, 'preview': 1, 'type': 1, 'storedName': 1, 'isImage': 1, 'imageBlurHash': 1, 'commentCount': 1}))
  for obj in objs:
    if obj['type'] == 'file' and 'storedName' in obj:
      obj['url'] = uploads.get_presigned_url('projects/{0}/{1}'.format(project['_id'], obj['storedName']))
    if obj['type'] == 'pattern' and 'preview' in obj and '.png' in obj['preview']:
      obj['previewUrl'] = uploads.get_presigned_url('projects/{0}/{1}'.format(project['_id'], obj['preview']))
      del obj['preview']
  return objs

def create_object(user, username, path, data):
  if not data and not data.get('type'): raise util.errors.BadRequest('Invalid request')
  if not data.get('type'): raise util.errors.BadRequest('Object type is required.')
  db = database.get_db()
  project = get_by_username(username, path)
  if not util.can_edit_project(user, project): raise util.errors.Forbidden('Forbidden')
  file_count = db.objects.find({'project': project['_id']}).count()

  if data['type'] == 'file':
    if not 'storedName' in data:
      raise util.errors.BadRequest('File stored name must be included')
    obj = {
      'project': project['_id'],
      'name': data.get('name', 'Untitled file'),
      'storedName': data['storedName'],
      'createdAt': datetime.datetime.now(),
      'type': 'file',
    }
    if re.search(r'(.jpg)|(.png)|(.jpeg)|(.gif)$', data['storedName'].lower()):
      obj['isImage'] = True
    result = db.objects.insert_one(obj)
    obj['_id'] = result.inserted_id
    obj['url'] = uploads.get_presigned_url('projects/{0}/{1}'.format(project['_id'], obj['storedName']))
    if obj.get('isImage'):
      def handle_cb(h):
        db.objects.update_one({'_id': obj['_id']}, {'$set': {'imageBlurHash': h}})
      uploads.blur_image('projects/' + str(project['_id']) + '/' + data['storedName'], handle_cb)
    return obj
  if data['type'] == 'pattern':
    obj = {
      'project': project['_id'],
      'createdAt': datetime.datetime.now(),
      'type': 'pattern',
    }
    if data.get('wif'):
      try:
        pattern = wif.loads(data['wif'])
        if pattern:
          obj['name'] = pattern['name']
          obj['pattern'] = pattern
      except Exception as e:
        raise util.errors.BadRequest('Unable to load WIF file. It is either invalid or in a format we cannot understand.')
    else:
      pattern = default_pattern.copy()
      pattern['warp'].update({'shafts': data.get('shafts', 8)})
      pattern['weft'].update({'treadles': data.get('treadles', 8)})
      obj['name'] = data.get('name') or 'Untitled Pattern'
      obj['pattern'] = pattern
    result = db.objects.insert_one(obj)
    obj['_id'] = result.inserted_id
    images = wif.generate_images(obj)
    if images:
      db.objects.update_one({'_id': obj['_id']}, {'$set': images})

    return objects.get(user, obj['_id'])
  raise util.errors.BadRequest('Unable to create object')


