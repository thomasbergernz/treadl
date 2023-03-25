from threading import Thread
import firebase_admin
from firebase_admin import messaging

default_app = firebase_admin.initialize_app()

def handle_send_multiple(users, title, body, extra = {}):
  tokens = []
  for user in users:
    if user.get('pushToken'): tokens.append(user['pushToken'])
  if not tokens: return

  # Create a list containing up to 500 messages.
  messages = list(map(lambda t: messaging.Message(
    notification=messaging.Notification(title, body),
    apns=messaging.APNSConfig(
      payload=messaging.APNSPayload(
        aps=messaging.Aps(badge=1, sound='default'),
      ),
    ),
    token=t,
    data=extra,
  ), tokens))
  try:
    response = messaging.send_all(messages)
    print('{0} messages were sent successfully'.format(response.success_count)) 
  except Exception as e:
    print('Error sending notification', str(e))

def send_multiple(users, title, body, extra = {}):
  thr = Thread(target=handle_send_multiple, args=[users, title, body, extra])
  thr.start()

def send_single(user, title, body, extra = {}):
  token = user.get('pushToken')
  if not token: return
  message = messaging.Message(	
    notification=messaging.Notification(
      title = title,
      body = body,
    ),
    apns=messaging.APNSConfig(
      payload=messaging.APNSPayload(
        aps=messaging.Aps(badge=1, sound='default'),
      ),
    ),
    data = extra,
    token = token,
  )
  try:
    response = messaging.send(message)
    # Response is a message ID string.
    print('Successfully sent message:', response)
  except Exception as e:
    print('Error sending notification', str(e))
