import datetime
from bson.objectid import ObjectId
from util import database, util

def list_for_user(user):
  db = database.get_db()
  snippets = db.snippets.find({'user': user['_id']}).sort('createdAt', -1)
  return {'snippets': list(snippets)}

def create(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  name = data.get('name', '')
  snippet_type = data.get('type', '')
  if len(name) < 3: raise util.errors.BadRequest('A longer name is required')
  if snippet_type not in ['warp', 'weft']:
    raise util.errors.BadRequest('Invalid snippet type')
  db = database.get_db()
  snippet = {
    'name': name,
    'user': user['_id'],
    'createdAt': datetime.datetime.now(),
    'type': snippet_type,
    'threading': data.get('threading', []),
    'treadling': data.get('treadling', []),
  }
  result = db.snippets.insert_one(snippet)
  snippet['_id'] = result.inserted_id
  return snippet

def delete(user, id):
  db = database.get_db()
  snippet = db.snippets.find_one({'_id': ObjectId(id), 'user': user['_id']})
  if not snippet:
    raise util.errors.BadRequest('Snippet not found')
  db.snippets.remove({'_id': snippet['_id']})
  return {'deletedSnippet': snippet['_id'] }
