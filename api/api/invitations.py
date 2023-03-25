import re, datetime, os
import pymongo
from bson.objectid import ObjectId
from util import database, util, mail
from api import uploads, groups

APP_NAME = os.environ.get('APP_NAME')
APP_URL = os.environ.get('APP_URL')

def get(user):
  db = database.get_db()
  admin_groups = list(db.groups.find({'admins': user['_id']}))
  invites = list(db.invitations.find({'$or': [{'recipient': user['_id']}, {'recipientGroup': {'$in': list(map(lambda g: g['_id'], admin_groups))}}]}))
  inviters = list(db.users.find({'_id': {'$in': [i['user'] for i in invites]}}, {'username': 1, 'avatar': 1}))
  for invite in invites:
    invite['recipient'] = user['_id']
    if invite['type'] in ['group', 'groupJoinRequest']: invite['group'] = db.groups.find_one({'_id': invite['typeId']}, {'name': 1})
    for u in inviters:
      if u['_id'] == invite['user']:
        if 'avatar' in u:
          u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
        invite['invitedBy'] = u
        break
  sent_invites = list(db.invitations.find({'user': user['_id']}))
  recipients = list(db.users.find({'_id': {'$in': list(map(lambda i: i.get('recipient'), sent_invites))}}, {'username': 1, 'avatar': 1}))
  for invite in sent_invites:
    if invite['type'] in ['group', 'groupJoinRequest']: invite['group'] = db.groups.find_one({'_id': invite['typeId']}, {'name': 1})
    for u in recipients:
      if u['_id'] == invite.get('recipient'):
        if 'avatar' in u:
          u['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
        invite['invitedBy'] = u
        break
  return {'invitations': invites, 'sentInvitations': sent_invites}

def accept(user, id):
  db = database.get_db()
  id = ObjectId(id)
  invite = db.invitations.find_one({'_id': id})
  if not invite: raise util.errors.NotFound('Invitation not found')
  if invite['type'] == 'group':
    if invite['recipient'] != user['_id']: raise util.errors.Forbidden('This invitation is not yours to accept')
    group = db.groups.find_one({'_id': invite['typeId']}, {'name': 1})
    if not group:
      db.invitations.remove({'_id': id})
      return {'acceptedInvitation': id}
    groups.create_member(user, group['_id'], user['_id'], invited = True)
    db.invitations.remove({'_id': id})
    return {'acceptedInvitation': id, 'group': group}
  if invite['type'] == 'groupJoinRequest':
    group = db.groups.find_one({'_id': invite['typeId']})
    if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You need to be an admin of this group to accept this request')
    requester = db.users.find_one({'_id': invite['user']})
    if not group or not requester:
      db.invitations.remove({'_id': id})
      return {'acceptedInvitation': id}
    groups.create_member(requester, group['_id'], requester['_id'], invited = True)
    db.invitations.remove({'_id': id})
    return {'acceptedInvitation': id, 'group': group}

def delete(user, id):
  db = database.get_db()
  id = ObjectId(id)
  invite = db.invitations.find_one({'_id': id})
  if not invite: raise util.errors.NotFound('Invitation not found')
  if invite['type'] == 'group':
    if invite['recipient'] != user['_id']: raise util.errors.Forbidden('This invitation is not yours to decline')
  if invite['type'] == 'groupJoinRequest':
    group = db.groups.find_one({'_id': invite['typeId']})
    if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You need to be an admin of this group to manage this request')
  db.invitations.remove({'_id': id})
  return {'deletedInvitation': id}

def create_group_invitation(user, group_id, data):
  if not data or 'user' not in data: raise util.errors.BadRequest('Invalid request')
  db = database.get_db()
  recipient_id = ObjectId(data['user'])
  group_id = ObjectId(group_id)
  group = db.groups.find_one({'_id': group_id}, {'admins': 1, 'name': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You need to be a group admin to invite users')
  recipient = db.users.find_one({'_id': recipient_id}, {'groups': 1, 'username': 1, 'email': 1, 'subscriptions': 1})
  if not recipient: raise util.errors.NotFound('User not found')
  if group_id in recipient.get('groups', []): raise util.errors.BadRequest('This user is already in this group')
  if db.invitations.find_one({'recipient': recipient_id, 'typeId': group_id, 'type': 'group'}):
    raise util.errors.BadRequest('This user has already been invited to this group')
  invite = {
    'createdAt': datetime.datetime.now(),
    'user': user['_id'],
    'recipient': recipient_id,
    'type': 'group',
    'typeId': group_id
  }
  result = db.invitations.insert_one(invite)
  if 'groups.invited' in recipient.get('subscriptions', {}).get('email', []):
    mail.send({
      'to_user': recipient,
      'subject': 'You\'ve been invited to a group on {}!'.format(APP_NAME),
      'text': 'Dear {0},\n\nYou have been invited to join the group {1} on {3}!\n\nLogin by visting {2} to find your invitation.'.format(
        recipient['username'],
        group['name'],
        APP_URL,
        APP_NAME,
      )
    })
  invite['_id'] = result.inserted_id
  return invite

def create_group_request(user, group_id):
  db = database.get_db()
  group_id = ObjectId(group_id)
  group = db.groups.find_one({'_id': group_id}, {'admins': 1, 'name': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if group_id in user.get('groups'): raise util.errors.BadRequest('You are already a member of this group')
  admin = db.users.find_one({'_id': {'$in': group.get('admins', [])}}, {'groups': 1, 'username': 1, 'email': 1, 'subscriptions': 1})
  if not admin: raise util.errors.NotFound('No users can approve you to join this group')
  if db.invitations.find_one({'recipient': user['_id'], 'typeId': group_id, 'type': 'group'}):
    raise util.errors.BadRequest('You have already been invited to this group')
  if db.invitations.find_one({'user': user['_id'], 'typeId': group_id, 'type': 'groupJoinRequest'}):
    raise util.errors.BadRequest('You have already requested access to this group')
  invite = {
    'createdAt': datetime.datetime.now(),
    'user': user['_id'],
    'recipientGroup': group['_id'],
    'type': 'groupJoinRequest',
    'typeId': group_id
  }
  result = db.invitations.insert_one(invite)
  if 'groups.joinRequested' in admin.get('subscriptions', {}).get('email', []):
    mail.send({
      'to_user': admin,
      'subject': 'Someone wants to join your group',
      'text': 'Dear {0},\n\{1} has requested to join your group {2} on {4}!\n\nLogin by visting {3} to find and approve your requests.'.format(
        admin['username'],
        user['username'],
        group['name'],
        APP_URL,
        APP_NAME,
      )
    })
  invite['_id'] = result.inserted_id
  return invite

def get_group_invitations(user, id):
  db = database.get_db()
  group_id = ObjectId(id)
  group = db.groups.find_one({'_id': group_id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You need to be a group admin to see invitations')
  invites = list(db.invitations.find({'type': 'group', 'typeId': group_id}))
  recipients = list(db.users.find({'_id': {'$in': [i['recipient'] for i in invites]}}, {'username': 1, 'avatar': 1}))
  for invite in invites:
    for recipient in recipients:
      if invite['recipient'] == recipient['_id']:
        if 'avatar' in recipient:
          recipient['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(recipient['_id'], recipient['avatar']))
        invite['recipientUser'] = recipient
        break
  return {'invitations': invites}

def delete_group_invitation(user, id, invite_id):
  db = database.get_db()
  group_id = ObjectId(id)
  invite_id = ObjectId(invite_id)
  group = db.groups.find_one({'_id': group_id}, {'admins': 1})
  if not group: raise util.errors.NotFound('Group not found')
  if user['_id'] not in group.get('admins', []): raise util.errors.Forbidden('You need to be a group admin to see invitations')
  invite = db.invitations.find_one({'_id': invite_id})
  if not invite or invite['typeId'] != group_id: raise util.errors.NotFound('This invite could not be found')
  db.invitations.remove({'_id': invite_id})
  return {'deletedInvite': invite_id}
