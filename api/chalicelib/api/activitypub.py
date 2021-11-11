from chalicelib.util import database, util
from chalicelib.api import uploads

def webfinger_user(username, servername):
  db = database.get_db()
  fetch_user = db.users.find_one({'username': username}, {'username': 1, 'createdAt': 1})
  if not fetch_user:
    raise util.errors.NotFound('User not found')
  return {
    'subject': f"acct:{fetch_user['username']}@{servername}",
    'links': [
      {
        'rel': 'http://webfinger.net/rel/profile-page',
        'type': 'text/html',
        'href': f"https://treadl.com/{fetch_user['username']}"
      },
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': f"https://treadl.com/users/{fetch_user['username']}"
      }
    ] 
  }

def user(username):
  db = database.get_db()
  fetch_user = db.users.find_one({'username': username}, {'username': 1, 'createdAt': 1, 'avatar': 1, 'avatarBlurHash': 1, 'bio': 1, 'location': 1, 'website': 1, 'twitter': 1, 'facebook': 1, 'linkedIn': 1, 'instagram': 1})
  if not fetch_user:
    raise util.errors.NotFound('User not found')
  if 'avatar' in fetch_user:
    fetch_user['avatarUrl'] = uploads.get_presigned_url('users/{0}/{1}'.format(str(fetch_user['_id']), fetch_user['avatar']))
  username = fetch_user['username']
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
      {
        "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
        "PropertyValue": "schema:PropertyValue",
        "schema": "http://schema.org#",
        "value": "schema:value"
      }
    ],
    "id": f"https://treadl.com/users/{username}",
    "type": "Person",
    "following": f"https://treadl.com/users/{username}/following",
    "followers": f"https://treadl.com/users/{username}/followers",
    "inbox": f"https://treadl.com/users/{username}/inbox",
    "outbox": f"https://treadl.com/users/{username}/outbox",
    "preferredUsername": username,
    "name": username,
    "summary": fetch_user.get('bio'),
    "url": f"https://treadl.com/{username}",
    "discoverable": True,
    "manuallyApprovesFollowers": False,
    "publicKey": {
      "id": f"https://treadl.com/users/{username}#main-key",
      "owner": f"https://treadl.com/users/{username}",
      "publicKeyPem": ""
    },
    "icon": {
      "type": "Image",
      "mediaType": "image/jpeg",
      "url": fetch_user['avatarUrl']
    },
    "image": {
      "type": "Image",
      "mediaType": "image/jpeg",
      "url": fetch_user['avatarUrl']
    },
    "endpoints": {
      "sharedInbox": "https://treadl.com/f/inbox"
    }
  }


def outbox(username):
  db = database.get_db()
  fetch_user = db.users.find_one({'username': username}, {'username': 1})
  if not fetch_user:
    raise util.errors.NotFound('User not found')
 
  username = fetch_user['username']
  feed = []

  feed.append({
      "id": f"https://treadl.com/users/{username}/statuses/107197029153980712/activity",
      "type": "Create",
      "actor": f"https://treadl.com/users/{username}",
      "published": "2021-11-09T18:17:15Z",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "cc": [
        f"https://treadl.com/users/{username}/followers"
      ],
      "object": {
        "id": f"https://treadl.com/users/{username}/statuses/107197029153980712",
        "type": "Note",
        "summary": None,
        "inReplyTo": None,
        "published": "2021-11-09T18:17:15Z",
        "url": f"https://treadl.com/{username}", # URL to object
        "attributedTo": f"https://treadl.com/users/{username}",
        "to": [
          "https://www.w3.org/ns/activitystreams#Public"
        ],
        "cc": [
          f"https://treadl.com/users/{username}/followers"
        ],
        "content": "<p>This is a test!</p>",
        "attachment": [],
        "tag": [],
      }
    })

  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      {
        "ostatus": "http://ostatus.org#",
        "atomUri": "ostatus:atomUri",
        "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
        "conversation": "ostatus:conversation",
        "sensitive": "as:sensitive",
      }
    ],
    "id": f"https://treadl.com/users/{username}/outbox?page=true",
    "type": "OrderedCollectionPage",
    "orderedItems": feed
  }