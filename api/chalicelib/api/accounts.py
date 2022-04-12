import datetime, jwt, bcrypt, re, os
from bson.objectid import ObjectId
from chalicelib.util import database, mail, util
from chalicelib.api import uploads

jwt_secret = os.environ['JWT_SECRET']
MIN_PASSWORD_LENGTH = 8

def register(username, email, password):
  if not username or len(username) < 4 or not email or len(email) < 6:
    raise util.errors.BadRequest('Your username or email is too short or invalid.')
  username = username.lower()
  email = email.lower()
  if not re.match("^[a-z0-9_]+$", username):
    raise util.errors.BadRequest('Usernames can only contain letters, numbers, and underscores')
  if not password or len(password) < MIN_PASSWORD_LENGTH:
    raise util.errors.BadRequest('Your password should be at least {0} characters.'.format(MIN_PASSWORD_LENGTH))
  db = database.get_db()
  existingUser = db.users.find_one({'$or': [{'username': username}, {'email': email}]})
  if existingUser:
    raise util.errors.BadRequest('An account with this username or email already exists.')

  try:
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    result = db.users.insert_one({ 'username': username, 'email': email, 'password': hashed_password, 'createdAt': datetime.datetime.now(), 'subscriptions': {'email': ['groups.invited', 'groups.joinRequested', 'groups.joined', 'messages.replied', 'projects.commented']}})
    mail.send({
      'to': 'will@seastorm.co',
      'subject': 'Treadl signup',
      'text': 'A new user signed up with username {0} and email {1}'.format(username, email)
    })
    mail.send({
      'to': email,
      'subject': 'Welcome to Treadl!',
      'text': '''Dear {},

Welcome to Treadl! We won't send you many emails but we just want to introduce ourselves and to give you some tips to help you get started.

LOGGING-IN

To login to your account please visit https://treadl.com and click Login. Use your username ({}) and password to get back into your account.

INTRODUCTION

Treadl has been designed as a resource for weavers – not only for those working alone as individuals, but also for groups who wish to share ideas, design inspirations and weaving patterns. It is ideal for those looking for a depository to store their individual work, and also for groups such as guilds, teaching groups, or any other collaborative working partnerships.
Projects can be created within Treadl using the integral WIF-compatible draft editor, or alternatively files can be imported from other design software along with supporting images and other information you may wish to be saved within the project file. Once complete, projects may be stored privately, shared within a closed group, or made public for other Treadl users to see. The choice is yours!

Treadl is free to use. For more information please visit our website at https://treadl.com.

GETTING STARTED

Creating a profile: You can add a picture, links to a personal website, and other social media accounts to tell others more about yourself.

Creating a group: You have the option to do things alone, or create a group. By clicking on the ‘Create a group’ button, you can name your group, and then invite members via email or directly through Treadl if they are existing Treadl users.

Creating a new project: When you are ready to create/store a project on the system, you are invited to give the project a name, and a brief description. You will then be taken to a ‘Welcome to your project’ screen, where if you click on ‘add something’, you have the option of creating a new weaving pattern directly inside Treadl or you can simply import a WIF file from your preferred weaving software. Once imported, you can perform further editing within Treadl, or you can add supporting picture files and any other additional information you wish to keep (eg weaving notes, yarn details etc).

Once complete you then have the option of saving the file privately, shared within a group, or made public for other Treadl users to see.

We hope you enjoy using Treadl and if you have any comments or feedback please tell us by emailing hello@treadl.com!

Best wishes,

The Treadl Team
'''.format(username, username)
    })
    return {'token': generate_access_token(result.inserted_id)}
  except Exception as e:
    print(e)
    raise util.errors.BadRequest('Unable to register your account. Please try again later')

def login(email, password):
  db = database.get_db()
  user = db.users.find_one({'$or': [{'username': email.lower()}, {'email': email.lower()}]})
  try:
    if user and bcrypt.checkpw(password.encode("utf-8"), user['password']):
      return {'token': generate_access_token(user['_id'])}
    else:
      raise util.errors.BadRequest('Your username or password is incorrect.')
  except Exception as e:
    raise util.errors.BadRequest('Your username or password is incorrect.')

def logout(user):
  db = database.get_db()
  db.users.update({'_id': user['_id']}, {'$pull': {'tokens.login': user['currentToken']}})
  return {'loggedOut': True}

def update_email(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  if 'email' not in data: raise util.errors.BadRequest('Invalid request')
  if len(data['email']) < 4: raise util.errors.BadRequest('New email is too short')
  db = database.get_db()
  db.users.update_one({'_id': user['_id']}, {'$set': {'email': data['email']}})
  mail.send({
    'to': user['email'],
    'subject': 'Your email address has changed on Treadl',
    'text': 'Dear {},\n\nThis email is to let you know that we recently received a request to change your account email address on Treadl. We have now made this change.\n\nThe new email address for your account is {}.\n\nIf you think this is a mistake then please get in touch with us as soon as possible.'.format(user['username'], data['email'])
  })
  mail.send({
    'to': data['email'],
    'subject': 'Your email address has changed on Treadl',
    'text': 'Dear {},\n\nThis email is to let you know that we recently received a request to change your account email address on Treadl. We have now made this change.\n\nThe new email address for your account is {}.\n\nIf you think this is a mistake then please get in touch with us as soon as possible.'.format(user['username'], data['email'])
  })
  return {'email': data['email']}

def update_password(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  if 'newPassword' not in data: raise util.errors.BadRequest('Invalid request')
  if len(data['newPassword']) < MIN_PASSWORD_LENGTH: raise util.errors.BadRequest('New password should be at least {0} characters long'.format(MIN_PASSWORD_LENGTH))

  db = database.get_db()
  if 'currentPassword' in data:
    if not bcrypt.checkpw(data['currentPassword'].encode('utf-8'), user['password']):
      raise util.errors.BadRequest('Incorrect password')
  elif 'token' in data:
    try:
      id = jwt.decode(data['token'], jwt_secret)['sub']
      user = db.users.find_one({'_id': ObjectId(id), 'tokens.passwordReset': data['token']})
      if not user: raise Exception
    except Exception as e:
      raise util.errors.BadRequest('There was a problem updating your password. Your token may be invalid or out of date')
  else:
    raise util.errors.BadRequest('Current password or reset token is required')
  if not user: raise util.errors.BadRequest('Unable to change your password')

  hashed_password = bcrypt.hashpw(data['newPassword'].encode("utf-8"), bcrypt.gensalt())
  db.users.update({'_id': user['_id']}, {'$set': {'password': hashed_password}, '$unset': {'tokens.passwordReset': ''}})

  mail.send({
    'to_user': user,
    'subject': 'Your Treadl password has changed',
    'text': 'Dear {},\n\nThis email is to let you know that we recently received a request to change your account password on Treadl. We have now made this change.\n\nIf you think this is a mistake then please login to change your password as soon as possible.'.format(user['username'])
  })
  return {'passwordUpdated': True}

def delete(user, password):
  if not password or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
    raise util.errors.BadRequest('Incorrect password')
  db = database.get_db()
  for project in db.projects.find({'user': user['_id']}):
    db.objects.remove({'project': project['_id']})
    db.projects.remove({'_id': project['_id']})
  db.users.remove({'_id': user['_id']})
  return {'deletedUser': user['_id']}

def generate_access_token(user_id):
  payload = {
    'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
    'iat': datetime.datetime.utcnow(),
    'sub': str(user_id)
  }
  token = jwt.encode(payload, jwt_secret, algorithm='HS256').decode("utf-8")
  db = database.get_db()
  db.users.update({'_id': user_id}, {'$addToSet': {'tokens.login': token}})
  return token

def get_user_context(token):
  if not token: return None
  try:
    payload = jwt.decode(token, jwt_secret)
    id = payload['sub']
    if id:
      db = database.get_db()
      user = db.users.find_one({'_id': ObjectId(id), 'tokens.login': token})
      db.users.update({'_id': user['_id']}, {'$set': {'lastSeenAt': datetime.datetime.now()}})
      user['currentToken'] = token
      return user
  except Exception as e:
    print(e)
    return None

def reset_password(data):
  if not data or not 'email' in data: raise util.errors.BadRequest('Invalid request')
  if len(data['email']) < 5: raise util.errors.BadRequest('Your email is too short')
  db = database.get_db()
  user = db.users.find_one({'email': data['email'].lower()})
  if user:
    payload = {
      'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
      'iat': datetime.datetime.utcnow(),
      'sub': str(user['_id'])
    }
    token = jwt.encode(payload, jwt_secret, algorithm='HS256').decode('utf-8')
    mail.send({
      'to_user': user,
      'subject': 'Reset your password',
      'text': 'Dear {0},\n\nA password reset email was recently requested for your Treadl account. If this was you and you want to continue, please follow the link below:\n\n{1}\n\nThis link will expire after 24 hours.\n\nIf this was not you, then someone may be trying to gain access to your account. We recommend using a strong and unique password for your account.'.format(user['username'], 'https://treadl.com/password/reset?token=' + token)
    })
    db.users.update({'_id': user['_id']}, {'$set': {'tokens.passwordReset': token}})
  return {'passwordResetEmailSent': True}

def update_push_token(user, data):
  if not data or 'pushToken' not in data: raise util.errors.BadRequest('Push token is required')
  db = database.get_db()
  db.users.update_one({'_id': user['_id']}, {'$set': {'pushToken': data['pushToken']}})
  return {'addedPushToken': data['pushToken']}
