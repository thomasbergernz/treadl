import os, time, re
from threading import Thread
from bson.objectid import ObjectId
import boto3
from botocore.client import Config
import blurhash
from util import database, util

def sanitise_filename(s):
  bad_chars = re.compile('[^a-zA-Z0-9_.]')
  s = bad_chars.sub('_', s)
  return s

def get_s3():
  session = boto3.session.Session()

  s3_client = session.client(
      service_name='s3',
      aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
      endpoint_url=os.environ['AWS_S3_ENDPOINT'],
  )
  return s3_client

def get_presigned_url(path):
  return os.environ['AWS_S3_ENDPOINT'] + os.environ['AWS_S3_BUCKET'] + '/' + path
  s3 = get_s3()
  return s3.generate_presigned_url('get_object',
    Params = {
      'Bucket': os.environ['AWS_S3_BUCKET'],
      'Key': path
    }
  )

def get_file(key):
  s3 = get_s3()
  return s3.get_object(
    Bucket = os.environ['AWS_S3_BUCKET'],
    Key = key
  )

def generate_file_upload_request(user, file_name, file_size, file_type, for_type, for_id):
  if int(file_size) > (1024 * 1024 * 30): # 30MB
    raise util.errors.BadRequest('File size is too big')
  db = database.get_db()
  allowed = False
  path = ''
  if for_type == 'project':
    project = db.projects.find_one(ObjectId(for_id))
    allowed = project and project.get('user') == user['_id']
    path = 'projects/' + for_id + '/'
  if for_type == 'user':
    allowed = for_id == str(user['_id'])
    path = 'users/' + for_id + '/'
  if for_type == 'group':
    allowed = ObjectId(for_id) in user.get('groups', [])
    path = 'groups/' + for_id + '/'
  if not allowed:
    raise util.errors.Forbidden('You\'re not allowed to upload this file')

  file_body, file_extension = os.path.splitext(file_name)
  new_name = sanitise_filename('{0}_{1}{2}'.format(file_body or file_name, int(time.time()), file_extension or ''))
  s3 = get_s3()
  signed_url = s3.generate_presigned_url('put_object',
    Params = {
      'Bucket': os.environ['AWS_S3_BUCKET'],
      'Key': path + new_name,
      'ContentType': file_type
    }
  )
  return {
    'signedRequest': signed_url,
    'fileName': new_name
  }

def handle_blur_image(key, func):
  f = get_file(key)['Body']
  bhash = blurhash.encode(f, x_components=4, y_components=3)
  func(bhash)

def blur_image(key, func):
  thr = Thread(target=handle_blur_image, args=[key, func])
  thr.start()
