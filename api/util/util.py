import json, datetime
from flask import request, Response
import werkzeug
from flask_limiter.util import get_remote_address
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from bson.objectid import ObjectId
from api import accounts
from util import util

errors = werkzeug.exceptions

def get_user(required = True):
  headers = request.headers
  if not headers.get('Authorization') and required:
    raise util.errors.Unauthorized('This resource requires authentication')
  if headers.get('Authorization'):
    user = accounts.get_user_context(headers.get('Authorization').replace('Bearer ', ''))
    if user is None and required:
      raise util.errors.Unauthorized('Invalid token')
    return user
  return None

def limit_by_client():
  data = request.get_json()
  if data:
    if data.get('email'): return data.get('email')
    if data.get('token'): return data.get('token')
  return get_remote_address()

def limit_by_user():
  user = util.get_user(required = False)
  return user['_id'] if user else get_remote_address()

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

def generate_rsa_keypair():
  private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=4096
  )
  private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
  )
  public_key = private_key.public_key()
  public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
  )
  return private_pem, public_pem
class MongoJsonEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
      return obj.isoformat()
    elif isinstance(obj, ObjectId):
      return str(obj)
    return json.JSONEncoder.default(self, obj)

def jsonify(*args, **kwargs):
  resp_data = json.dumps(dict(*args, **kwargs), cls=MongoJsonEncoder)
  resp = Response(resp_data)
  resp.headers['Content-Type'] = 'application/json'
  return resp
