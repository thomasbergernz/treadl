import json, datetime
import werkzeug
from bson.objectid import ObjectId
from chalicelib.api import accounts, billing

errors = werkzeug.exceptions

def has_plan(user, plan_key):
  if not user: return False
  user_billing = user.get('billing', {})
  if plan_key == 'free':
    if not user_billing.get('planId'): return True
  plan_id = None
  for plan in billing.plans:
    if plan['key'] == plan_key:
      plan_id = plan['id']
      break
  return user_billing.get('planId') == plan_id

def can_view_project(user, project):
  if not project: return False
  if project.get('visibility') == 'public':
    return True
  if not user: return False
  if project.get('visibility') == 'private' and user['_id'] == project['user']:
    return True
  if set(user.get('groups', [])).intersection(project.get('groupVisibility', [])):
    return True
  if 'root' in user.get('roles', []): return True
  return False

def filter_keys(obj, allowed_keys):
  filtered = {}
  for key in allowed_keys:
    if key in obj:
      filtered[key] = obj[key]
  return filtered

def build_updater(obj, allowed_keys):
  if not obj: return {}
  allowed = filter_keys(obj, allowed_keys)
  updater = {}
  for key in allowed:
    if not allowed[key]:
      if '$unset' not in updater: updater['$unset'] = {}
      updater['$unset'][key] = ''
    else:
      if '$set' not in updater: updater['$set'] = {}
      updater['$set'][key] = allowed[key]
  return updater


class MongoJsonEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
      return obj.isoformat()
    elif isinstance(obj, ObjectId):
      return str(obj)
    return json.JSONEncoder.default(self, obj)

def jsonify(*args, **kwargs):
  return json.dumps(dict(*args, **kwargs), cls=MongoJsonEncoder)
