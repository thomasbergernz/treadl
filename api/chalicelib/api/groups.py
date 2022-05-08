import datetime, re, os
import pymongo
from bson.objectid import ObjectId
from chalicelib.util import database, util, mail, push
from chalicelib.api import uploads

APP_NAME = os.environ.get('APP_NAME')
APP_URL = os.environ.get('APP_URL')

def create(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  if len(data.get('name')) < 3: raise util.errors.BadRequest('A longer name is required')
  db = database.get_db()

  group = {
    'createdAt': datetime.datetime.now(),
    'user': user['_id'],
    'admins': [user['_id']],
    'name': data['name'],
    'description': data.get('description', ''),
    'closed': data.get('closed', False),
  }
  result = db.groups.insert_one(group)
  group['_id'] = result.inserted_id
  create_member(user, group['_id'], user['_id'])
  return group

def get(user):
  db = database.get_db()
  groups = list(db.groups.find({'_id': {'$in': user.get('groups', [])}}))
  return {'groups': groups}

def get_one(user, id):
  db = database.get_db()
  id  = ObjectId(id)
  group = db.groups.find_one({'_id': id})
  if not group: raise util.errors.NotFound('Group not found')
  group['adminUsers'] = list(db.users.find({'_id': {'$in': group.get('admins', [])}}, {'username': 1, 'avatar': 1}))
  for u in group['adminUsers']:
    if 'avatar' in u:
      u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
  return group

def update(user, id, update):
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You\'re not a group admin')
  allowed_keys = ['name', 'description', 'closed']
  updater = util.build_updater(update, allowed_keys)
  if updater: db.groups.update({'_id': id}, updater)
  return get_one(user, id)

def delete(user, id):
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You\'re not a group admin')
  db.groups.remove({'_id': id})
  db.groupEntries.remove({'group': id})
  db.users.update({'groups': id}, {'$pull': {'groups': id}}, multi = True)
  return {'deletedGroup': id}

def create_entry(user, id, data):
  if not data or 'content' not in data: raise util.errors.BadRequest('Invalid request')
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1, 'name': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if group['_id'] not in user.get('groups', []): raise util.errors.Forbidden('You must be a member to write in the feed')
  entry = {
    'createdAt': datetime.datetime.now(),
    'group': id,
    'user': user['_id'],
    'content': data['content'],
  }
  if 'attachments' in data:
    entry['attachments'] = data['attachments']
    for attachment in entry['attachments']:
      if re.search(r'(.jpg)|(.png)|(.jpeg)|(.gif)$', attachment['storedName'].lower()):
        attachment['isImage'] = True
      if attachment['type'] == 'file':
        attachment['url'] = uploads.get_presigned_url('groups/{0}/{1}'.format(id, attachment['storedName']))

  result = db.groupEntries.insert_one(entry)
  entry['_id'] = result.inserted_id
  entry['authorUser'] = {'_id': user['_id'], 'username': user['username'], 'avatar': user.get('avatar')}
  if 'avatar' in user:
    entry['authorUser']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(user['_id'], user['avatar']))

  for u in db.users.find({'_id': {'$ne': user['_id']}, 'groups': id, 'subscriptions.email': 'groupFeed-' + str(id)}, {'email': 1, 'username': 1}):
    mail.send({
      'to_user': u,
      'subject': 'New message in ' + group['name'],
      'text': 'Dear {0},\n\n{1} posted a message in the Notice Board of {2} on {5}:\n\n{3}\n\nFollow the link below to visit the group:\n\n{4}'.format(
        u['username'],
        user['username'],
        group['name'],
        data['content'],
        '{}/groups/{}'.format(APP_URL, str(id)),
        APP_NAME,
      )
    })
  push.send_multiple(list(db.users.find({'_id': {'$ne': user['_id']}, 'groups': id})), '{} posted in {}'.format(user['username'], group['name']), data['content'][:30] + '...')
  return entry

def get_entries(user, id):
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if id not in user.get('groups', []): raise util.errors.BadRequest('You\'re not a member of this group')
  entries = list(db.groupEntries.find({'group': id}).sort('createdAt', pymongo.DESCENDING))
  authors = list(db.users.find({'_id': {'$in': [e['user'] for e in entries]}}, {'username': 1, 'avatar': 1}))
  for entry in entries:
    if 'attachments' in entry:
      for attachment in entry['attachments']:
        attachment['url'] = uploads.get_presigned_url('groups/{0}/{1}'.format(id, attachment['storedName']))
    for author in authors:
      if entry['user'] == author['_id']:
        entry['authorUser'] = author
        if 'avatar' in author:
          entry['authorUser']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(author['_id'], author['avatar']))
  return {'entries': entries}

def delete_entry(user, id, entry_id):
  db = database.get_db()
  id = ObjectId(id)
  entry_id = ObjectId(entry_id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  entry = db.groupEntries.find_one(entry_id, {'user': 1, 'group': 1})
  if not entry or entry['group'] != id: raise util.errors.NotFound('Entry not found')
  if entry['user'] != user['_id'] and user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You must own the entry or be an admin of the group')
  db.groupEntries.remove({'$or': [{'_id': entry_id}, {'inReplyTo': entry_id}]})
  return {'deletedEntry': entry_id}

def create_entry_reply(user, id, entry_id, data):
  if not data or 'content' not in data: raise util.errors.BadRequest('Invalid request')
  db = database.get_db()
  id = ObjectId(id)
  entry_id = ObjectId(entry_id)
  group = db.groups.find_one({'_id': id}, {'admins': 1, 'name': 1})
  if not group: raise util.errors.NotFound('Group not found')
  entry = db.groupEntries.find_one({'_id': entry_id})
  if not entry or entry.get('group') != group['_id']: raise util.errors.NotFound('Entry to reply to not found')
  if group['_id'] not in user.get('groups', []): raise util.errors.Forbidden('You must be a member to write in the feed')
  reply = {
    'createdAt': datetime.datetime.now(),
    'group': id,
    'inReplyTo': entry_id,
    'user': user['_id'],
    'content': data['content'],
  }
  if 'attachments' in data:
    reply['attachments'] = data['attachments']
    for attachment in reply['attachments']:
      if re.search(r'(.jpg)|(.png)|(.jpeg)|(.gif)$', attachment['storedName'].lower()):
        attachment['isImage'] = True
      if attachment['type'] == 'file':
        attachment['url'] = uploads.get_presigned_url('groups/{0}/{1}'.format(id, attachment['storedName']))

  result = db.groupEntries.insert_one(reply)
  reply['_id'] = result.inserted_id
  reply['authorUser'] = {'_id': user['_id'], 'username': user['username'], 'avatar': user.get('avatar')}
  if 'avatar' in user:
    reply['authorUser']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(user['_id'], user['avatar']))
  op = db.users.find_one({'$and': [{'_id': entry.get('user')}, {'_id': {'$ne': user['_id']}}], 'subscriptions.email': 'messages.replied'})
  if op:
    mail.send({
      'to_user': op,
      'subject': user['username'] + ' replied to your post',
      'text': 'Dear {0},\n\n{1} replied to your message in the Notice Board of {2} on {5}:\n\n{3}\n\nFollow the link below to visit the group:\n\n{4}'.format(
        op['username'],
        user['username'],
        group['name'],
        data['content'],
        '{}/groups/{}'.format(APP_URL, str(id)),
        APP_NAME,
      )
    })
  return reply

def delete_entry_reply(user, id, entry_id, reply_id):
  db = database.get_db()
  id = ObjectId(id)
  entry_id = ObjectId(entry_id)
  reply_id = ObjectId(reply_id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  entry = db.groupEntries.find_one(entry_id, {'user': 1, 'group': 1})
  if not entry or entry['group'] != id: raise util.errors.NotFound('Entry not found')
  reply = db.groupEntries.find_one(reply_id)
  if not reply or reply.get('inReplyTo') != entry_id: raise util.errors.NotFound('Reply not found')
  if entry['user'] != user['_id'] and reply['user'] != user['_id'] and user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You must own the reply or entry or be an admin of the group')
  db.groupEntries.remove({'_id': entry_id})
  return {'deletedEntry': entry_id}

def create_member(user, id, user_id, invited = False):
  db = database.get_db()
  id = ObjectId(id)
  user_id = ObjectId(user_id)
  group = db.groups.find_one({'_id': id}, {'admins': 1, 'name': 1, 'closed': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user_id != user['_id']: raise util.errors.Forbidden('Not allowed to add someone else to the group')
  if group.get('closed') and not invited and user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('Not allowed to join a closed group')
  db.users.update({'_id': user_id}, {'$addToSet': {'groups': id, 'subscriptions.email': 'groupFeed-' + str(id)}})
  db.invitations.remove({'type': 'group', 'typeId': id, 'recipient': user_id})
  for admin in db.users.find({'_id': {'$in': group.get('admins', []), '$ne': user_id}, 'subscriptions.email': 'groups.joined'}, {'email': 1, 'username': 1}):
    mail.send({
      'to_user': admin,
      'subject': 'Someone joined your group',
      'text': 'Dear {0},\n\n{1} recently joined your group {2} on {4}!\n\nFollow the link below to manage your group:\n\n{3}'.format(
        admin['username'],
        user['username'],
        group['name'],
        '{}/groups/{}'.format(APP_URL, str(id)),
        APP_NAME,
      )
    })

  return {'newMember': user_id}

def get_members(user, id):
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if id not in user.get('groups', []) and not 'root' in user.get('roles', []): raise util.errors.Forbidden('You need to be a member to see the member list')
  members = list(db.users.find({'groups': id}, {'username': 1, 'avatar': 1, 'bio': 1, 'groups': 1}))
  for m in members:
    if 'avatar' in m:
      m['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(m['_id'], m['avatar']))
  return {'members': members}

def delete_member(user, id, user_id):
  id = ObjectId(id)
  user_id = ObjectId(user_id)
  db = database.get_db()
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user_id != user['_id'] and user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You can\'t remove this user')
  if user_id in group.get('admins', []) and len(group['admins']) == 1:
    raise util.errors.Forbidden('There needs to be at least one admin in this group')
  db.users.update({'_id': user_id}, {'$pull': {'groups': id, 'subscriptions.email': 'groupFeed-' + str(id)}})
  db.groups.update({'_id': id}, {'$pull': {'admins': user_id}})
  return {'deletedMember': user_id}

def get_projects(user, id):
  db = database.get_db()
  id = ObjectId(id)
  group = db.groups.find_one({'_id': id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if id not in user.get('groups', []): raise util.errors.Forbidden('You need to be a member to see the project list')
  projects = list(db.projects.find({'groupVisibility': id}, {'name': 1, 'path': 1, 'user': 1, 'description': 1, 'visibility': 1}))
  authors = list(db.users.find({'groups': id, '_id': {'$in': list(map(lambda p: p['user'], projects))}}, {'username': 1, 'avatar': 1, 'bio': 1}))
  for a in authors:
    if 'avatar' in a:
      a['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(a['_id'], a['avatar']))
  for project in projects:
    for a in authors:
      if project['user'] == a['_id']:
        project['owner'] = a
        project['fullName'] = a['username'] + '/' + project['path']
        break
  return {'projects': projects}
