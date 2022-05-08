import os
from threading import Thread
import requests

def handle_send(data):
  if 'from' not in data:
    data['from'] = 'Treadl <{}>'.format(os.environ.get('FROM_EMAIL'))
  if 'to_user' in data:
    user = data['to_user']
    data['to'] = user['username'] + ' <' + user['email'] + '>'
    del data['to_user']
  data['text'] += '\n\nFrom the team at Treadl\n\n\n\n--\n\nDon\'t like this email? Choose which emails you receive from Treadl by visiting {}/settings/notifications\n\nReceived this email in error? Please let us know by contacting {}'.format(os.environ.get('APP_URL'), os.environ.get('CONTACT_EMAIL'))
  data['reply-to'] = os.environ.get('CONTACT_EMAIL')

  base_url = os.environ.get('MAILGUN_URL')
  api_key = os.environ.get('MAILGUN_KEY')
  if base_url and api_key:
    auth = ('api', api_key)
    try:
      response = requests.post(base_url, auth=auth, data=data)
      response.raise_for_status()
    except:
      print('Unable to send email')
  else:
    print('Not sending email. Message pasted below.')
    print(data)

def send(data):
  thr = Thread(target=handle_send, args=[data])
  thr.start()
