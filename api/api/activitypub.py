import os, re
from util import database, util
from api import uploads

DOMAIN = os.environ.get('APP_DOMAIN')

def webfinger(resource):
  if not resource: raise util.errors.BadRequest('Resource required')
  resource = resource.lower()
  exp = re.compile('acct:([a-z0-9_-]+)@([a-z0-9_\-\.]+)', re.IGNORECASE)
  matches = exp.findall(resource)
  if not matches or not matches[0]: raise util.errors.BadRequest('Resource invalid')
  username, host = matches[0]
  if not username or not host: raise util.errors.BadRequest('Resource invalid')
  if host != DOMAIN: raise util.errors.NotFound('Host unknown')
  
  db = database.get_db()
  user = db.users.find_one({'username': username})
  if not user: raise util.errors.NotFound('User unknown')

  return {
    "subject": resource,
    "aliases": [
      "https://{}/{}".format(DOMAIN, username),
      "https://{}/u/{}".format(DOMAIN, username)
    ],
    "links": [
      {
        "rel": "http://webfinger.net/rel/profile-page",
        "type": "text/html",
        "href": "https://{}/{}".format(DOMAIN, username)
      },
      {
        "rel": "self",
        "type": "application/activity+json",
        "href": "https://{}/u/{}".format(DOMAIN, username)
      },
      {
        "rel": "http://ostatus.org/schema/1.0/subscribe",
        "template": "https://{}/authorize_interaction".format(DOMAIN) + "?uri={uri}"
      }
    ]
  }

def user(username):
  if not username: raise util.errors.BadRequest('Username required')
  username = username.lower()
  db = database.get_db()
  user = db.users.find_one({'username': username})
  if not user: raise util.errors.NotFound('User unknown')
  avatar_url = user.get('avatar') and uploads.get_presigned_url('users/{0}/{1}'.format(user['_id'], user['avatar']))

  pub_key = None
  if user.get('services', {}).get('activityPub', {}).get('publicKey'):
    pub_key = user['services']['activityPub']['publicKey']
  else:
    priv_key, pub_key = util.generate_rsa_keypair()
    db.users.update_one({'_id': user['_id']}, {'$set': {
      'services.activityPub.publicKey': pub_key,
      'services.activityPub.privateKey': priv_key,
    }})

  resp = {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    "id": "https://{}/u/{}".format(DOMAIN, username),
    "type": "Person",
    #"following": "https://fosstodon.org/users/wilw/following",
    #"followers": "https://fosstodon.org/users/wilw/followers",
    "inbox": "https://{}/inbox".format(DOMAIN),
    "outbox": "https://{}/u/{}/outbox".format(DOMAIN, username),
    "preferredUsername": username,
    "name": username,
    "summary": user.get('bio', ''),
    "url": "https://{}/{}".format(DOMAIN, username),
    "discoverable": True,
    "published": "2021-01-27T00:00:00Z",
    "publicKey": {
      "id": "https://{}/u/{}#main-key".format(DOMAIN, username),
      "owner": "https://{}/u/{}".format(DOMAIN, username),
      "publicKeyPem": pub_key.decode('utf-8')
    },
    "attachment": [],
    "endpoints": {
      "sharedInbox": "https://{}/inbox".format(DOMAIN)
    },
    "icon": {
      "type": "Image",
      "mediaType": "image/jpeg",
      "url": avatar_url
    },
    "image": {
      "type": "Image",
      "mediaType": "image/jpeg",
      "url": avatar_url
    }
  }

  if user.get('website'):
    resp['attachment'].append({
      "type": "PropertyValue",
      "name": "Website",
      "value": "<a href=\"https://{}\" target=\"_blank\" rel=\"nofollow noopener noreferrer me\"><span class=\"invisible\">https://</span><span class=\"\">{}</span><span class=\"invisible\"></span></a>".format(user['website'], user['website'])
    })

  return resp

def outbox(username, page, min_id, max_id):
  if not username: raise util.errors.BadRequest('Username required')
  username = username.lower()
  db = database.get_db()
  user = db.users.find_one({'username': username})
  if not user: raise util.errors.NotFound('User unknown')

  if not page or page != 'true':
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://{}/u/{}/outbox".format(DOMAIN, username),
      "type": "OrderedCollection",
      "first": "https://{}/u/{}/outbox?page=true".format(DOMAIN, username)
    }
  if page == 'true':
    min_string = '&min_id={}'.format(min_id) if min_id else ''
    max_string = '&max_id={}'.format(max_id) if max_id else ''
    ret = {
      "id": "https://{}/u/{}/outbox?page=true{}{}".format(DOMAIN, username, min_string, max_string),
      "type": "OrderedCollectionPage",
      #"next": "https://example.org/users/whatever/outbox?max_id=01FJC1Q0E3SSQR59TD2M1KP4V8&page=true",
      #"prev": "https://example.org/users/whatever/outbox?min_id=01FJC1Q0E3SSQR59TD2M1KP4V8&page=true",
      "partOf": "https://{}/u/{}/outbox".format(DOMAIN, username),
      "orderedItems": []
    }

    project_list = list(db.projects.find({'user': user['_id'], 'visibility': 'public'}))
    for p in project_list:
      ret['orderedItems'].append({
        "id": "https://{}/{}/{}/activity".format(DOMAIN, username, p['path']),
        "type": "Create",
        "actor": "https://{}/u/{}".format(DOMAIN, username),
        "published": p['createdAt'].strftime("%Y-%m-%dT%H:%M:%SZ"),#"2021-10-18T20:06:18Z",
        "to": [
            "https://www.w3.org/ns/activitystreams#Public"
        ],
        "object": {
          "id": "https://{}/{}/{}".format(DOMAIN, username, p['path']),
          "type": "Note",
          "summary": None,
          #"inReplyTo": "https://mastodon.lhin.space/users/0xvms/statuses/108759565436297722",
          "published": p['createdAt'].strftime("%Y-%m-%dT%H:%M:%SZ"),#"2022-08-03T15:43:30Z",
          "url": "https://{}/{}/{}".format(DOMAIN, username, p['path']),
          "attributedTo": "https://{}/u/{}".format(DOMAIN, username),
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "cc": [
            "https://{}/u/{}/followers".format(DOMAIN, username),
          ],
          "sensitive": False,
          "content": "{} created a project: {}".format(username, p['name']),
        }
      })
    
    return ret