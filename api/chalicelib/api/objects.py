import datetime, base64
from bson.objectid import ObjectId
import requests
from chalicelib.util import database, wif, util, mail
from chalicelib.api import uploads

def delete(user, id):
  db = database.get_db()
  obj = db.objects.find_one(ObjectId(id), {'project': 1})
  if not obj:
    raise util.errors.NotFound('Object not found')
  project = db.projects.find_one(obj.get('project'), {'user': 1})
  if not project:
    raise util.errors.NotFound('Project not found')
  if project['user'] != user['_id']:
    raise util.errors.Forbidden('Forbidden', 403)
  db.objects.remove(ObjectId(id))
  return {'deletedObject': id}

def get(user, id):
  db = database.get_db()
  return db.objects.find_one(ObjectId(id))

def copy_to_project(user, id, project_id):
  db = database.get_db()
  obj = db.objects.find_one(ObjectId(id))
  if not obj: raise util.errors.NotFound('This object could not be found')
  original_project = db.projects.find_one(obj['project'])
  if not original_project:
    raise util.errors.NotFound('Project not found')
  if not original_project.get('openSource') and not (user and user['_id'] == original_project['user']):
    raise util.errors.Forbidden('This project is not open-source')
  target_project = db.projects.find_one(ObjectId(project_id))
  if not target_project or target_project['user'] != user['_id']:
    raise util.errors.Forbidden('You don\'t own the target project')
  
  obj['_id'] = ObjectId()
  obj['project'] = target_project['_id']
  obj['createdAt'] = datetime.datetime.now()
  obj['commentCount'] = 0
  db.objects.insert_one(obj)
  return obj

def get_wif(user, id):
  db = database.get_db()
  obj = db.objects.find_one(ObjectId(id))
  if not obj: raise util.errors.NotFound('Object not found')
  project = db.projects.find_one(obj['project'])
  if not project.get('openSource') and not (user and user['_id'] == project['user']):
    raise util.errors.Forbidden('This project is not open-source')
  try:
    output = wif.dumps(obj).replace('\n', '\\n')
    return {'wif': output}
  except Exception as e:
    raise util.errors.BadRequest('Unable to create WIF file')

def get_pdf(user, id):
  db = database.get_db()
  obj = db.objects.find_one(ObjectId(id))
  if not obj: raise util.errors.NotFound('Object not found')
  project = db.projects.find_one(obj['project'])
  if not project.get('openSource') and not (user and user['_id'] == project['user']):
    raise util.errors.Forbidden('This project is not open-source')
  try:
    response = requests.get('https://h2io6k3ovg.execute-api.eu-west-1.amazonaws.com/prod/pdf?object=' + id + '&landscape=true&paperWidth=23.39&paperHeight=33.11')
    response.raise_for_status()
    pdf = uploads.get_file('objects/' + id + '/export.pdf')
    body64 = base64.b64encode(pdf['Body'].read())
    bytes_str = str(body64).replace("b'", '')[:-1]
    return {'pdf': body64.decode('ascii')}
  except Exception as e:
    print(e)
    raise util.errors.BadRequest('Unable to export PDF')

def update(user, id, data):
  db = database.get_db()
  obj = db.objects.find_one(ObjectId(id), {'project': 1})
  if not obj: raise util.errors.NotFound('Object not found')
  project = db.projects.find_one(obj.get('project'), {'user': 1})
  if not project: raise util.errors.NotFound('Project not found')
  if project['user'] != user['_id']: raise util.errors.Forbidden('Forbidden')
  allowed_keys = ['name', 'description', 'pattern', 'preview']
  updater = util.build_updater(data, allowed_keys)
  if updater:
    db.objects.update({'_id': ObjectId(id)}, updater)
  return get(user, id)

def create_comment(user, id, data):
  if not data or not data.get('content'): raise util.errors.BadRequest('Comment data is required')
  db = database.get_db()
  obj = db.objects.find_one({'_id': ObjectId(id)})
  if not obj: raise util.errors.NotFound('We could not find the specified object')
  project = db.projects.find_one({'_id': obj['project']})
  comment = {
    'content': data.get('content', ''),
    'object': ObjectId(id),
    'user': user['_id'],
    'createdAt': datetime.datetime.now()
  }
  result = db.comments.insert_one(comment)
  db.objects.update_one({'_id': ObjectId(id)}, {'$inc': {'commentCount': 1}})
  comment['_id'] = result.inserted_id
  comment['authorUser'] = {
    'username': user['username'],
    'avatar': user.get('avatar'),
    'avatarUrl': uploads.get_presigned_url('users/{0}/{1}'.format(user['_id'], user.get('avatar')))
  }
  project_owner = db.users.find_one({'_id': project['user'], 'subscriptions.email': 'projects.commented'})
  if project_owner and project_owner['_id'] != user['_id']:
    mail.send({
      'to_user': project_owner,
      'subject': '{} commented on {}'.format(user['username'], project['name']),
      'text': 'Dear {0},\n\n{1} commented on {2} in your project {3} on Treadl:\n\n{4}\n\nFollow the link below to see the comment:\n\n{5}'.format(project_owner['username'], user['username'], obj['name'], project['name'], comment['content'], 'https://treadl.com/{}/{}/{}'.format(project_owner['username'], project['path'], str(id)))
    })
  return comment

def get_comments(user, id):
  db = database.get_db()
  comments = list(db.comments.find({'object': ObjectId(id)}))
  user_ids = list(map(lambda c:c['user'], comments))
  users = list(db.users.find({'_id': {'$in': user_ids}}, {'username': 1, 'avatar': 1}))
  for comment in comments:
    for u in users:
      if comment['user'] == u['_id']:
        comment['authorUser'] = u
        if 'avatar' in u:
          comment['authorUser']['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(u['_id'], u['avatar']))
  return {'comments': comments}

def delete_comment(user, id, comment_id):
  db = database.get_db()
  comment = db.comments.find_one({'_id': ObjectId(comment_id)})
  obj = db.objects.find_one({'_id': ObjectId(id)})
  if not comment or not obj or obj['_id'] != comment['object']: raise util.errors.NotFound('Comment not found')
  project = db.projects.find_one({'_id': obj['project']})
  if comment['user'] != user['_id'] and comment['user'] != project['user']: raise util.errors.Forbidden('You can\'t delete this comment')
  db.comments.remove({'_id': comment['_id']})
  db.objects.update_one({'_id': ObjectId(id)}, {'$inc': {'commentCount': -1}})
  return {'deletedComment': comment['_id']}
