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
  project_query = {'user': ObjectId(id)}
  if not user or not user['_id'] == ObjectId(id):
    project_query['visibility'] = 'public'
  for project in db.projects.find(project_query):
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
  
def get_feed(user, username):
  db = database.get_db()
  if user['username'] != username: raise util.errors.Forbidden('Forbidden')
  following_user_ids = list(map(lambda f: f['user'], user.get('following', [])))
  following_project_ids = list(map(lambda p: p['_id'], db.projects.find({'user': {'$in': following_user_ids}, 'visibility': 'public'}, {'_id': 1})))
  one_year_ago = datetime.datetime.utcnow() - datetime.timedelta(days = 365)
  
  # Fetch the items for the feed
  recent_projects = list(db.projects.find({
    '_id': {'$in': following_project_ids},
    'createdAt': {'$gt': one_year_ago},
    'visibility': 'public',
  }, {'user': 1, 'createdAt': 1, 'name': 1, 'path': 1, 'visibility': 1}).sort('createdAt', -1).limit(20))
  recent_objects = list(db.objects.find({
    'project': {'$in': following_project_ids},
    'createdAt': {'$gt': one_year_ago}
  }, {'project': 1, 'createdAt': 1, 'name': 1}).sort('createdAt', -1).limit(30))
  recent_comments = list(db.comments.find({
    'user': {'$in': following_user_ids},
    'createdAt': {'$gt': one_year_ago}
  }, {'user': 1, 'createdAt': 1, 'object': 1, 'content': 1}).sort('createdAt', -1).limit(30))
  
  # Process objects (as don't know the user)
  object_project_ids = list(map(lambda o: o['project'], recent_objects))
  object_projects = list(db.projects.find({'_id': {'$in': object_project_ids}, 'visibility': 'public'}, {'user': 1}))
  for obj in recent_objects:
    for proj in object_projects:
      if obj['project'] == proj['_id']: obj['user'] = proj.get('user')
      
  # Process comments as don't know the project
  comment_object_ids = list(map(lambda c: c['object'], recent_comments))
  comment_objects = list(db.objects.find({'_id': {'$in': comment_object_ids}}, {'project': 1}))
  for com in recent_comments:
    for obj in comment_objects:
      if com['object'] == obj['_id']: com['project'] = obj.get('project')
  
  # Prepare the feed items, and sort it
  feed_items = []
  for p in recent_projects:
    p['feedType'] = 'project'
    feed_items.append(p)
  for o in recent_objects:
    o['feedType'] = 'object'
    feed_items.append(o)
  for c in recent_comments:
    c['feedType'] = 'comment'
    feed_items.append(c)
  feed_items.sort(key=lambda d: d['createdAt'], reverse = True)
  feed_items = feed_items[:20]
  
  # Post-process the feed, adding user/project objects
  feed_user_ids = set()
  feed_project_ids = set()
  for f in feed_items:
    feed_user_ids.add(f.get('user'))
    feed_project_ids.add(f.get('project'))
  feed_projects = list(db.projects.find({'_id': {'$in': list(feed_project_ids)}, 'visibility': 'public'}, {'name': 1, 'path': 1, 'user': 1, 'visibility': 1}))
  feed_users = list(db.users.find({'$or': [
    {'_id': {'$in': list(feed_user_ids)}},
    {'_id': {'$in': list(map(lambda p: p['user'], feed_projects))}},
  ]}, {'username': 1, 'avatar': 1, 'isSilverSupporter': 1, 'isGoldSupporter': 1}))
  for u in feed_users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(str(u['_id']), u['avatar']))
  feed_user_map = {}
  feed_project_map = {}
  for u in feed_users: feed_user_map[str(u['_id'])] = u
  for p in feed_projects: feed_project_map[str(p['_id'])] = p
  for f in feed_items:
    if f.get('user') and feed_user_map.get(str(f['user'])):
      f['userObject'] = feed_user_map.get(str(f['user']))
    if f.get('project') and feed_project_map.get(str(f['project'])):
      f['projectObject'] = feed_project_map.get(str(f['project']))
    if f.get('projectObject', {}).get('user') and feed_user_map.get(str(f['projectObject']['user'])):
      f['projectObject']['userObject'] = feed_user_map.get(str(f['projectObject']['user']))
  
  # Filter out orphaned or non-public comments/objects
  def filter_func(f):
    if f['feedType'] == 'comment' and not f.get('projectObject'):
      return False
    if f['feedType'] == 'object' and not f.get('projectObject'):
      return False
    return True
  feed_items = list(filter(filter_func, feed_items))
  
  return {'feed': feed_items}
  