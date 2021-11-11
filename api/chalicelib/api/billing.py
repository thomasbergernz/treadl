import datetime, os
from bson.objectid import ObjectId
from chalicelib.util import database, util
import stripe

stripe.api_key = os.environ.get('STRIPE_KEY')

plans = [{
    'id': 'free',
    'key': 'free',
    'name': 'Free',
    'description': 'Free to beta users. No credit card needed.',
    'price': '$0.00',
    'features': [
      'Use our weaving pattern creator, editor, & tools',
      'Unlimited public projects',
      '2 private projects',
      'Up to 10 items per project',
      'Import patterns in WIF format',
      'Export patterns to WIF format',
      'Share your projects and work with the world',
      'Create and manage groups and community pages'
    ],
  },
  {
    'id': os.environ.get('STRIPE_PLAN_WEAVER'),
    'key': 'weaver',
    'name': 'Weaver',
    'description': '🍺 A pint a month.',
    'price': '$7.00',
    'features': [
      'Everything in the "Free" plan',
      'Unlimited private projects',
      'Unlimited closed-source projects',
      'Up to 20 items per project',
      'Get access to new features first'
    ]
  }
]

def get_plans(user):
  return {'plans': plans}

def get(user):
  db = database.get_db()
  return db.users.find_one(user['_id'], {'billing.planId': 1, 'billing.card': 1}).get('billing', {})

def update_card(user, data):
  if not data: raise util.errors.BadRequest('Invalid request')
  if not data.get('token'): raise util.errors.BadRequest('Invalid request')
  token = data['token']
  card = token.get('card')
  if not card: raise util.errors.BadRequest('Invalid request')
  card['createdAt'] = datetime.datetime.now()
  db = database.get_db()

  if user.get('billing', {}).get('customerId'):
    customer = stripe.Customer.retrieve(user['billing']['customerId'])
    customer.source = token.get('id')
    customer.save()
  else:
    customer = stripe.Customer.create(
      source = token.get('id'),
      email = user['email'],
    )
    db.users.update({'_id': user['_id']}, {'$set': {'billing.customerId': customer.id}})

  db.users.update({'_id': user['_id']}, {'$set': {'billing.card': card}})
  return get(user)

def delete_card(user):
  card_id = user.get('billing', {}).get('card', {}).get('id')
  customer_id = user.get('billing').get('customerId')
  if not customer_id or not card_id: raise util.errors.NotFound('Card not found')
  try:
    customer = stripe.Customer.retrieve(customer_id)
    customer.sources.retrieve(card_id).delete()
  except:
    raise util.errors.BadRequest('Unable to delete your card at this time')
  db = database.get_db()
  db.users.update({'_id': user['_id']}, {'$unset': {'billing.card': ''}})
  return {'deletedCard': card_id}

def select_plan(user, plan_id):
  db = database.get_db()
  billing = user.get('billing', {})
  if plan_id == 'free' and billing.get('subscriptionId'):
    subscription = stripe.Subscription.retrieve(billing['subscriptionId'])
    subscription.delete()
    db.users.update({'_id': user['_id']}, {'$unset': {'billing.subscriptionId': '', 'billing.planId': ''}})

  if plan_id != 'free' and plan_id != billing.get('planId'):
    if not billing or not billing.get('customerId') or not billing.get('card'):
      raise util.errors.BadRequest('A payment card has not been added to this account')
    if 'subscriptionId' in billing:
      subscription = stripe.Subscription.retrieve(billing['subscriptionId'])
      stripe.Subscription.modify(billing['subscriptionId'],
        cancel_at_period_end=False,
        items=[{
          'id': subscription['items']['data'][0].id,
          'plan': plan_id,
        }]
      )
    else:
      subscription = stripe.Subscription.create(
        customer = billing['customerId'],
        items = [{'plan': plan_id}]
      )
      db.users.update({'_id': user['_id']}, {'$set': {'billing.subscriptionId': subscription.id}})
    db.users.update({'_id': user['_id']}, {'$set': {'billing.planId': plan_id}})

  return get(user)
