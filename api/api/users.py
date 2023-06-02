import datetime
from bson.objectid import ObjectId
from util import database, util
from api import uploads

def me(user):
  db = database.get_db()
  return {
    '_id': user['_id'],
    'username': user['username'],
    'bio': user.get('bio'),
    'email': user.get('email'),
    'avatar': user.get('avatar'),
    'avatarUrl': user.get('avatar') and uploads.get_presigned_url('users/{0}/{1}'.format(user['_id'], user['avatar'])),
    'roles': user.get('roles', []),
    'groups': user.get('groups', []),
    'subscriptions': user.get('subscriptions'),
    'finishedTours': user.get('completedTours', []) + user.get('skippedTours', []),
    'isSilverSupporter': user.get('isSilverSupporter'),
    'isGoldSupporter': user.get('isGoldSupporter'),
    'followerCount': db.users.find({'following.user': user['_id']}).count(),
  }

def get(user, username):
  db = database.get_db()
  fetch_user = db.users.find_one({'username': username}, {'username': 1, 'createdAt': 1, 'avatar': 1, 'avatarBlurHash': 1, 'bio': 1, 'location': 1, 'website': 1, 'twitter': 1, 'facebook': 1, 'linkedIn': 1, 'instagram': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1})
  if not fetch_user:
    raise util.errors.NotFound('User not found')
  project_query = {'user': fetch_user['_id']}
  if not user or not user['_id'] == fetch_user['_id']:
    project_query['visibility'] = 'public'

  fetch_user['projects'] = list(db.projects.find(project_query, {'name': 1, 'path': 1, 'description': 1, 'visibility': 1}).limit(15))
  for project in fetch_user['projects']:
    project['fullName'] = fetch_user['username'] + '/' + project['path']
  if 'avatar' in fetch_user:
    fetch_user['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(str(fetch_user['_id']), fetch_user['avatar']))
  if user:
    fetch_user['following'] = fetch_user['_id'] in list(map(lambda f: f['user'], user.get('following', [])))
  return fetch_user

def update(user, username, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  db = database.get_db()
  if user['username'] != username:
    raise util.errors.Forbidden('Not allowed')
  allowed_keys = ['username', 'avatar', 'bio', 'location', 'website', 'twitter', 'facebook', 'linkedIn', 'instagram']
  if 'username' in data:
    if not data.get('username') or len(data['username']) < 3:
      raise util.errors.BadRequest('New username is not valid')
    if db.users.find({'username': data['username'].lower()}).count():
      raise util.errors.BadRequest('A user with this username already exists')
    data['username'] = data['username'].lower()
  if data.get('avatar') and len(data['avatar']) > 3: # Not a default avatar
    def handle_cb(h):
      db.users.update_one({'_id': user['_id']}, {'$set': {'avatarBlurHash': h}})
    uploads.blur_image('users/' + str(user['_id']) + '/' + data['avatar'], handle_cb)
  updater = util.build_updater(data, allowed_keys)
  if updater:
    if 'avatar' in updater.get('$unset', {}): # Also unset blurhash if removing avatar
      updater['$unset']['avatarBlurHash'] = ''
    db.users.update({'username': username}, updater)
  return get(user, data.get('username', username))

def finish_tour(user, username, tour, status):
  db = database.get_db()
  if user['username'] != username:
    raise util.errors.Forbidden('Not allowed')
  key = 'completedTours' if status == 'completed' else 'skippedTours'
  db.users.update_one({'_id': user['_id']}, {'$addToSet': {key: tour}})
  return {'finishedTour': tour}

def get_projects(user, id):
  db = database.get_db()
  u = db.users.find_one(id, {'username': 1, 'avatar': 1})
  if not u: raise util.errors.NotFound('User not found')
  if 'avatar' in u: u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(str(u['_id']), u['avatar']))
  projects = []
  for project in db.projects.find({'user': ObjectId(id)}):
    project['owner'] = u
    project['fullName'] = u['username'] + '/' + project['path']
    projects.append(project)
  return projects

def create_email_subscription(user, username, subscription):
  db = database.get_db()
  if user['username'] != username: raise util.errors.Forbidden('Forbidden')
  u = db.users.find_one({'username': username})
  db.users.update({'_id': u['_id']}, {'$addToSet': {'subscriptions.email': subscription}})
  subs = db.users.find_one(u['_id'], {'subscriptions': 1})
  return {'subscriptions': subs.get('subscriptions', {})}

def delete_email_subscription(user, username, subscription):
  db = database.get_db()
  if user['username'] != username: raise util.errors.Forbidden('Forbidden')
  u = db.users.find_one({'username': username})
  db.users.update({'_id': u['_id']}, {'$pull': {'subscriptions.email': subscription}})
  subs = db.users.find_one(u['_id'], {'subscriptions': 1})
  return {'subscriptions': subs.get('subscriptions', {})}

def create_follower(user, username):
  db = database.get_db()
  target_user = db.users.find_one({'username': username.lower()})
  if not target_user: raise util.errors.NotFound('User not found')
  if target_user['_id'] == user['_id']: raise util.errors.BadRequest('Cannot follow yourself')
  follow_object = {
    'user': target_user['_id'],
    'followedAt': datetime.datetime.utcnow(),
  }
  db.users.update_one({'_id': user['_id']}, {'$addToSet': {'following': follow_object}})
  return follow_object
  
def delete_follower(user, username):
  db = database.get_db()
  target_user = db.users.find_one({'username': username.lower()})
  if not target_user: raise util.errors.NotFound('User not found')
  db.users.update_one({'_id': user['_id']}, {'$pull': {'following': {'user': target_user['_id']}}})
  return {'unfollowed': True}