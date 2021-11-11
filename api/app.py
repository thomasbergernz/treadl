import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import werkzeug
from chalicelib.util import util
from chalicelib.api import accounts, users, projects, objects, uploads, billing, groups, search, invitations, root, activitypub

SERVER_NAME = 'treadl.com'

app = Flask(__name__)
CORS(app)
app.debug = True

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

@app.errorhandler(werkzeug.exceptions.BadRequest)
def handle_bad_request(e):
  return jsonify({'message': e.description}), 400
@app.errorhandler(werkzeug.exceptions.Unauthorized)
def handle_not_authorized(e):
  return jsonify({'message': e.description}), 401
@app.errorhandler(werkzeug.exceptions.Forbidden)
def handle_forbidden(e):
  return jsonify({'message': e.description}), 403
@app.errorhandler(werkzeug.exceptions.NotFound)
def handle_not_found(e):
  return jsonify({'message': e.description}), 404

# ACCOUNTS

@app.route('/accounts/register', methods=['POST'])
def register():
  body = request.json
  return util.jsonify(accounts.register(body.get('username'), body.get('email'), body.get('password')))

@app.route('/accounts/login', methods=['POST'])
def login():
  body = request.json
  return util.jsonify(accounts.login(body.get('email'), body.get('password')))

@app.route('/accounts/logout', methods=['POST'])
def logout():
  return util.jsonify(accounts.logout(get_user()))



@app.route('/accounts', methods=['DELETE'])
def delete_account():
  body = request.json
  return util.jsonify(accounts.delete(get_user(), body.get('password')))

@app.route('/accounts/email', methods=['PUT'])
def email_address():
  body = request.json
  return util.jsonify(accounts.update_email(get_user(required=False), body))

@app.route('/accounts/password', methods=['PUT'])
def password():
  body = request.json
  return util.jsonify(accounts.update_password(get_user(required=False), body))

@app.route('/accounts/password/reset', methods=['POST'])
def reset_password():
  body = request.json
  return util.jsonify(accounts.reset_password(body))

@app.route('/accounts/pushToken', methods=['PUT'])
def set_push_token():
  return util.jsonify(accounts.update_push_token(get_user(), request.json))

# UPLOADS

@app.route('/uploads/file/request', methods=['GET'])
def file_request():
  params = request.args
  file_name = params.get('name')
  file_size = params.get('size')
  file_type = params.get('type')
  for_type = params.get('forType')
  for_id = params.get('forId')
  return util.jsonify(uploads.generate_file_upload_request(get_user(), file_name, file_size, file_type, for_type, for_id))


# USERS

@app.route('/users/me', methods=['GET'])
def users_me():
  return util.jsonify(users.me(get_user()))

@app.route('/users/<username>', methods=['GET', 'PUT'])
def users_username(username):
  if request.method == 'GET': return util.jsonify(users.get(get_user(required=False), username))
  if request.method == 'PUT': return util.jsonify(users.update(get_user(), username, request.json))

@app.route('/users/me/projects', methods=['GET'])
def me_projects_route():
  user = get_user()
  return util.jsonify({'projects': users.get_projects(user, user['_id'])})

@app.route('/users/<username>/subscriptions/email/<subscription>', methods=['PUT', 'DELETE'])
def user_email_subscription(username, subscription):
  if request.method == 'PUT': return util.jsonify(users.create_email_subscription(get_user(), username, subscription))
  if request.method == 'DELETE': return util.jsonify(users.delete_email_subscription(get_user(), username, subscription))

# PROJECTS

@app.route('/projects', methods=['POST'])
def projects_route():
  return util.jsonify(projects.create(get_user(), request.json))

@app.route('/projects/<username>/<project_path>/objects', methods=['GET', 'POST'])
def project_objects_get(username, project_path):
  if request.method == 'GET':
    return util.jsonify({'objects': projects.get_objects(get_user(required=False), username, project_path)})
  if request.method == 'POST':
    return util.jsonify(projects.create_object(get_user(), username, project_path, request.json))

@app.route('/projects/<username>/<project_path>', methods=['GET', 'PUT', 'DELETE'])
def project_by_path(username, project_path):
  if request.method == 'GET':
    return util.jsonify(projects.get(get_user(required=False), username, project_path))
  if request.method == 'PUT':
    return util.jsonify(projects.update(get_user(), username, project_path, request.json))
  if request.method == 'DELETE':
    return util.jsonify(projects.delete(get_user(), username, project_path))


# BILLING

@app.route('/billing', methods=['GET'])
def get_billing():
  return util.jsonify(billing.get(get_user()))

@app.route('/billing/plans', methods=['GET'])
def get_plans():
  return util.jsonify(billing.get_plans(get_user(required=False)))

@app.route('/billing/card', methods=['GET', 'PUT', 'DELETE'])
def card():
  if request.method == 'PUT':
    return util.jsonify(billing.update_card(get_user(), request.json))
  if request.method == 'DELETE':
    return util.jsonify(billing.delete_card(get_user()))

@app.route('/billing/subscription/<plan_id>', methods=['PUT'])
def subscription(plan_id):
  if request.method == 'PUT':
    return util.jsonify(billing.select_plan(get_user(), plan_id))


# OBJECTS

@app.route('/objects/<id>', methods=['GET', 'DELETE', 'PUT'])
def objects_route(id):
  if request.method == 'GET':
    return util.jsonify(objects.get(get_user(required=False), id))
  if request.method == 'DELETE':
    return util.jsonify({'_id': objects.delete(get_user(), id)})
  if request.method == 'PUT':
    body = request.json
    return util.jsonify(objects.update(get_user(), id, body))

@app.route('/objects/<id>/projects/<project_id>', methods=['PUT'])
def copy_object_route(id, project_id):
  if request.method == 'PUT':
    return util.jsonify(objects.copy_to_project(get_user(), id, project_id))

@app.route('/objects/<id>/wif', methods=['GET'])
def objects_get_wif(id):
  if request.method == 'GET':
    return util.jsonify(objects.get_wif(get_user(required=False), id))

@app.route('/objects/<id>/pdf', methods=['GET'])
def objects_get_pdf(id):
  return util.jsonify(objects.get_pdf(get_user(required=False), id))

@app.route('/objects/<id>/comments', methods=['GET', 'POST'])
def object_comments(id):
  if request.method == 'GET':
    return util.jsonify(objects.get_comments(get_user(required=False), id))
  if request.method == 'POST':
    return util.jsonify(objects.create_comment(get_user(), id, request.json))

@app.route('/objects/<id>/comments/<comment_id>', methods=['DELETE'])
def object_comment(id, comment_id):
  return util.jsonify(objects.delete_comment(get_user(), id, comment_id))

# GROUPS

@app.route('/groups', methods=['POST', 'GET'])
def groups_route():
  if request.method == 'GET':
    return util.jsonify(groups.get(get_user(required=True)))
  if request.method == 'POST':
    return util.jsonify(groups.create(get_user(required=True), request.json))

@app.route('/groups/<id>', methods=['GET', 'PUT', 'DELETE'])
def group_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_one(get_user(required=False), id))
  if request.method == 'PUT':
    return util.jsonify(groups.update(get_user(required=True), id, request.json))
  if request.method == 'DELETE':
    return util.jsonify(groups.delete(get_user(required=True), id))
 
@app.route('/groups/<id>/entries', methods=['GET', 'POST'])
def group_entries_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_entries(get_user(required=True), id))
  if request.method == 'POST':
    return util.jsonify(groups.create_entry(get_user(required=True), id, request.json))

@app.route('/groups/<id>/entries/<entry_id>', methods=['DELETE'])
def group_entry_route(id, entry_id):
  if request.method == 'DELETE':
    return util.jsonify(groups.delete_entry(get_user(required=True), id, entry_id))

@app.route('/groups/<id>/entries/<entry_id>/replies', methods=['POST'])
def group_entry_replies_route(id, entry_id):
  return util.jsonify(groups.create_entry_reply(get_user(required=True), id, entry_id, request.json))
@app.route('/groups/<id>/entries/<entry_id>/replies/<reply_id>', methods=['DELETE'])
def group_entry_reply_route(id, entry_id, reply_id):
  return util.jsonify(groups.delete_entry_reply(get_user(required=True), id, entry_id, reply_id))

@app.route('/groups/<id>/members', methods=['GET'])
def group_members_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_members(get_user(required=True), id))

@app.route('/groups/<id>/members/<user_id>', methods=['PUT', 'DELETE'])
def group_member_route(id, user_id):
  if request.method == 'DELETE':
    return util.jsonify(groups.delete_member(get_user(required=True), id, user_id))
  if request.method == 'PUT':
    return util.jsonify(groups.create_member(get_user(required=True), id, user_id))

@app.route('/groups/<id>/projects', methods=['GET'])
def group_projects_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_projects(get_user(required=True), id))

@app.route('/groups/<id>/invitations', methods=['POST', 'GET'])
def group_invites_route(id):
  if request.method == 'POST':
    return util.jsonify(invitations.create_group_invitation(get_user(required=True), id, request.json))
  if request.method == 'GET':
    return util.jsonify(invitations.get_group_invitations(get_user(required=True), id))

@app.route('/groups/<id>/invitations/<invite_id>', methods=['DELETE'])
def group_invite_route(id, invite_id):
  return util.jsonify(invitations.delete_group_invitation(get_user(required=True), id, invite_id))

@app.route('/groups/<id>/requests', methods=['POST', 'GET'])
def group_requests_route(id):
  if request.method == 'POST':
    return util.jsonify(invitations.create_group_request(get_user(required=True), id))
  if request.method == 'GET':
    return util.jsonify(invitations.get_group_requests(get_user(required=True), id))

# SEARCH

@app.route('/search', methods=['GET'])
def search_all():
  params = request.args
  return util.jsonify(search.all(get_user(required=True), params))

@app.route('/search/users', methods=['GET'])
def search_users():
  params = request.args
  return util.jsonify(search.users(get_user(required=True), params))

# INVITATIONS

@app.route('/invitations', methods=['GET'])
def invites_route():
  return util.jsonify(invitations.get(get_user(required=True)))

@app.route('/invitations/<id>', methods=['PUT', 'DELETE'])
def invite_route(id):
  if request.method == 'PUT':
    return util.jsonify(invitations.accept(get_user(required=True), id))
  if request.method =='DELETE':
    return util.jsonify(invitations.delete(get_user(required=True), id))

## ROOT

@app.route('/root/users', methods=['GET'])
def root_users():
  return util.jsonify(root.get_users(get_user(required=True)))
@app.route('/root/groups', methods=['GET'])
def root_groups():
  return util.jsonify(root.get_groups(get_user(required=True)))

## ACTIVITYPUB

@app.route('/.well-known/webfinger', methods=['GET']) # /.well-known/webfinger?resource=acct:will@treadl.com
def well_known_webfinger():
  resource = request.args.get('resource')
  rr = re.compile('acct:([a-zA-Z0-9_]+)@([a-zA-Z0-9_.]+)', re.IGNORECASE)
  match = rr.match(resource)
  username = match.group(1)
  servername = match.group(2)
  if servername == SERVER_NAME:
    return jsonify(activitypub.webfinger_user(username, servername))
  return jsonify({'message': 'Server name not recognised'}), 404

@app.route('/activitypub/users/<username>', methods=['GET'])
def activitypub_user(username):
  return jsonify(activitypub.user(username))

@app.route('/activitypub/users/<username>/outbox', methods=['GET'])
def activitypub_user_outbox(username):
  return jsonify(activitypub.outbox(username))