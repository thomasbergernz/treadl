import re, datetime
import pymongo
from bson.objectid import ObjectId
from util import database, util, mail
from api import uploads, groups

def get_users(user):
  db = database.get_db()
  if not util.is_root(user): raise util.errors.Forbidden('Not allowed')
  users = list(db.users.find({}, {'username': 1, 'avatar': 1, 'email': 1, 'createdAt': 1, 'lastSeenAt': 1, 'roles': 1, 'groups': 1}).sort('lastSeenAt', -1).limit(200))
  group_ids = []
  for u in users: group_ids += u.get('groups', [])
  groups = list(db.groups.find({'_id': {'$in': group_ids}}, {'name': 1}))
  projects = list(db.projects.find({}, {'name': 1, 'path': 1, 'user': 1}))
  for u in users:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(str(u['_id']), u['avatar']))
    u['projects'] = []
    for p in projects:
      if p['user'] == u['_id']:
        u['projects'].append(p)
    u['groupMemberships'] = []
    if u.get('groups'):
      for g in groups:
        if g['_id'] in u.get('groups', []):
          u['groupMemberships'].append(g)
  return {'users': users}

def get_groups(user):
  db = database.get_db()
  if not util.is_root(user): raise util.errors.Forbidden('Not allowed')
  groups = list(db.groups.find({}))
  for group in groups:
    group['memberCount'] = db.users.find({'groups': group['_id']}).count()
  return {'groups': groups}
