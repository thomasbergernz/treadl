import os, json
from flask import Flask, request, Response, jsonify
from flask_limiter import Limiter
from flask_cors import CORS
import werkzeug
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from util import util
from api import accounts, users, projects, objects, uploads, groups, search, invitations, root, activitypub

app = Flask(__name__)
CORS(app)
limiter = Limiter(app, default_limits=['20 per minute'], key_func=util.limit_by_user)

if os.environ.get('SENTRY_DSN'):
  sentry_sdk.init(
    dsn=os.environ['SENTRY_DSN'],
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
  )

@app.errorhandler(werkzeug.exceptions.TooManyRequests)
def handle_429(e):
  return jsonify({'message': 'You\'re making too many requests. Please wait for a few minutes before trying again.', 'Allowed limit': e.description}), 429
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
@app.route('/debug-sentry')
def trigger_error():
  division_by_zero = 1 / 0

# ACCOUNTS
@limiter.limit('5 per minute', key_func=util.limit_by_client, methods=['POST'])
@app.route('/accounts/register', methods=['POST'])
def register():
  body = request.json
  return util.jsonify(accounts.register(body.get('username'), body.get('email'), body.get('password')))

@limiter.limit('5 per minute', key_func=util.limit_by_client, methods=['POST'])
@app.route('/accounts/login', methods=['POST'])
def login():
  body = request.json
  return util.jsonify(accounts.login(body.get('email'), body.get('password')))

@app.route('/accounts/logout', methods=['POST'])
def logout():
  return util.jsonify(accounts.logout(util.get_user()))

@app.route('/accounts', methods=['DELETE'])
def delete_account():
  body = request.json
  return util.jsonify(accounts.delete(util.get_user(), body.get('password')))

@app.route('/accounts/email', methods=['PUT'])
def email_address():
  body = request.json
  return util.jsonify(accounts.update_email(util.get_user(), body))

@limiter.limit('5 per minute', key_func=util.limit_by_user, methods=['POST'])
@app.route('/accounts/password', methods=['PUT'])
def password():
  body = request.json
  return util.jsonify(accounts.update_password(util.get_user(required=False), body))

@limiter.limit('5 per minute', key_func=util.limit_by_client, methods=['POST'])
@app.route('/accounts/password/reset', methods=['POST'])
def reset_password():
  body = request.json
  return util.jsonify(accounts.reset_password(body))

@app.route('/accounts/pushToken', methods=['PUT'])
def set_push_token():
  return util.jsonify(accounts.update_push_token(util.get_user(), request.json))

# UPLOADS

@app.route('/uploads/file/request', methods=['GET'])
def file_request():
  params = request.args
  file_name = params.get('name')
  file_size = params.get('size')
  file_type = params.get('type')
  for_type = params.get('forType')
  for_id = params.get('forId')
  return util.jsonify(uploads.generate_file_upload_request(util.get_user(), file_name, file_size, file_type, for_type, for_id))


# USERS

@app.route('/users/me', methods=['GET'])
def users_me():
  return util.jsonify(users.me(util.get_user()))

@app.route('/users/<username>', methods=['GET', 'PUT'])
def users_username(username):
  if request.method == 'GET': return util.jsonify(users.get(util.get_user(required=False), username))
  if request.method == 'PUT': return util.jsonify(users.update(util.get_user(), username, request.json))

@app.route('/users/<username>/tours/<tour>', methods=['PUT'])
def users_tour(username, tour):
  status = request.args.get('status', 'completed')
  return util.jsonify(users.finish_tour(util.get_user(), username, tour, status))

@app.route('/users/me/projects', methods=['GET'])
def me_projects_route():
  user = util.get_user()
  return util.jsonify({'projects': users.get_projects(user, user['_id'])})

@app.route('/users/<username>/subscriptions/email/<subscription>', methods=['PUT', 'DELETE'])
def user_email_subscription(username, subscription):
  if request.method == 'PUT': return util.jsonify(users.create_email_subscription(util.get_user(), username, subscription))
  if request.method == 'DELETE': return util.jsonify(users.delete_email_subscription(util.get_user(), username, subscription))

# PROJECTS

@app.route('/projects', methods=['POST'])
def projects_route():
  return util.jsonify(projects.create(util.get_user(), request.json))

@app.route('/projects/<username>/<project_path>/objects', methods=['GET', 'POST'])
def project_objects_get(username, project_path):
  if request.method == 'GET':
    return util.jsonify({'objects': projects.get_objects(util.get_user(required=False), username, project_path)})
  if request.method == 'POST':
    return util.jsonify(projects.create_object(util.get_user(), username, project_path, request.json))

@app.route('/projects/<username>/<project_path>', methods=['GET', 'PUT', 'DELETE'])
def project_by_path(username, project_path):
  if request.method == 'GET':
    return util.jsonify(projects.get(util.get_user(required=False), username, project_path))
  if request.method == 'PUT':
    return util.jsonify(projects.update(util.get_user(), username, project_path, request.json))
  if request.method == 'DELETE':
    return util.jsonify(projects.delete(util.get_user(), username, project_path))

# OBJECTS

@app.route('/objects/<id>', methods=['GET', 'DELETE', 'PUT'])
def objects_route(id):
  if request.method == 'GET':
    return util.jsonify(objects.get(util.get_user(required=False), id))
  if request.method == 'DELETE':
    return util.jsonify({'_id': objects.delete(util.get_user(), id)})
  if request.method == 'PUT':
    body = request.json
    return util.jsonify(objects.update(util.get_user(), id, body))

@app.route('/objects/<id>/projects/<project_id>', methods=['PUT'])
def copy_object_route(id, project_id):
  if request.method == 'PUT':
    return util.jsonify(objects.copy_to_project(util.get_user(), id, project_id))

@app.route('/objects/<id>/wif', methods=['GET'])
def objects_get_wif(id):
  if request.method == 'GET':
    return util.jsonify(objects.get_wif(util.get_user(required=False), id))

@app.route('/objects/<id>/pdf', methods=['GET'])
def objects_get_pdf(id):
  return util.jsonify(objects.get_pdf(util.get_user(required=False), id))

@app.route('/objects/<id>/comments', methods=['GET', 'POST'])
def object_comments(id):
  if request.method == 'GET':
    return util.jsonify(objects.get_comments(util.get_user(required=False), id))
  if request.method == 'POST':
    return util.jsonify(objects.create_comment(util.get_user(), id, request.json))

@app.route('/objects/<id>/comments/<comment_id>', methods=['DELETE'])
def object_comment(id, comment_id):
  return util.jsonify(objects.delete_comment(util.get_user(), id, comment_id))

# GROUPS

@app.route('/groups', methods=['POST', 'GET'])
def groups_route():
  if request.method == 'GET':
    return util.jsonify(groups.get(util.get_user(required=True)))
  if request.method == 'POST':
    return util.jsonify(groups.create(util.get_user(required=True), request.json))

@app.route('/groups/<id>', methods=['GET', 'PUT', 'DELETE'])
def group_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_one(util.get_user(required=False), id))
  if request.method == 'PUT':
    return util.jsonify(groups.update(util.get_user(required=True), id, request.json))
  if request.method == 'DELETE':
    return util.jsonify(groups.delete(util.get_user(required=True), id))

@app.route('/groups/<id>/entries', methods=['GET', 'POST'])
def group_entries_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_entries(util.get_user(required=True), id))
  if request.method == 'POST':
    return util.jsonify(groups.create_entry(util.get_user(required=True), id, request.json))

@app.route('/groups/<id>/entries/<entry_id>', methods=['DELETE'])
def group_entry_route(id, entry_id):
  if request.method == 'DELETE':
    return util.jsonify(groups.delete_entry(util.get_user(required=True), id, entry_id))

@app.route('/groups/<id>/entries/<entry_id>/replies', methods=['POST'])
def group_entry_replies_route(id, entry_id):
  return util.jsonify(groups.create_entry_reply(util.get_user(required=True), id, entry_id, request.json))
@app.route('/groups/<id>/entries/<entry_id>/replies/<reply_id>', methods=['DELETE'])
def group_entry_reply_route(id, entry_id, reply_id):
  return util.jsonify(groups.delete_entry_reply(util.get_user(required=True), id, entry_id, reply_id))

@app.route('/groups/<id>/members', methods=['GET'])
def group_members_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_members(util.get_user(required=True), id))

@app.route('/groups/<id>/members/<user_id>', methods=['PUT', 'DELETE'])
def group_member_route(id, user_id):
  if request.method == 'DELETE':
    return util.jsonify(groups.delete_member(util.get_user(required=True), id, user_id))
  if request.method == 'PUT':
    return util.jsonify(groups.create_member(util.get_user(required=True), id, user_id))

@app.route('/groups/<id>/projects', methods=['GET'])
def group_projects_route(id):
  if request.method == 'GET':
    return util.jsonify(groups.get_projects(util.get_user(required=True), id))

@app.route('/groups/<id>/invitations', methods=['POST', 'GET'])
def group_invites_route(id):
  if request.method == 'POST':
    return util.jsonify(invitations.create_group_invitation(util.get_user(required=True), id, request.json))
  if request.method == 'GET':
    return util.jsonify(invitations.get_group_invitations(util.get_user(required=True), id))

@app.route('/groups/<id>/invitations/<invite_id>', methods=['DELETE'])
def group_invite_route(id, invite_id):
  return util.jsonify(invitations.delete_group_invitation(util.get_user(required=True), id, invite_id))

@app.route('/groups/<id>/requests', methods=['POST', 'GET'])
def group_requests_route(id):
  if request.method == 'POST':
    return util.jsonify(invitations.create_group_request(util.get_user(required=True), id))
  if request.method == 'GET':
    return util.jsonify(invitations.get_group_requests(util.get_user(required=True), id))

# SEARCH

@app.route('/search', methods=['GET'])
def search_all():
  params = request.args
  return util.jsonify(search.all(util.get_user(required=True), params))

@app.route('/search/users', methods=['GET'])
def search_users():
  params = request.args
  return util.jsonify(search.users(util.get_user(required=True), params))

@app.route('/search/discover', methods=['GET'])
def search_discover():
  return util.jsonify(search.discover(util.get_user(required=True)))

# INVITATIONS

@app.route('/invitations', methods=['GET'])
def invites_route():
  return util.jsonify(invitations.get(util.get_user(required=True)))

@app.route('/invitations/<id>', methods=['PUT', 'DELETE'])
def invite_route(id):
  if request.method == 'PUT':
    return util.jsonify(invitations.accept(util.get_user(required=True), id))
  if request.method =='DELETE':
    return util.jsonify(invitations.delete(util.get_user(required=True), id))

## ROOT

@app.route('/root/users', methods=['GET'])
def root_users():
  return util.jsonify(root.get_users(util.get_user(required=True)))
@app.route('/root/groups', methods=['GET'])
def root_groups():
  return util.jsonify(root.get_groups(util.get_user(required=True)))


## ActivityPub Support

@app.route('/.well-known/webfinger', methods=['GET'])
def webfinger():
  resource = request.args.get('resource')
  return util.jsonify(activitypub.webfinger(resource))

@app.route('/u/<username>', methods=['GET'])
def ap_user(username):
  resp_data = activitypub.user(username)
  resp = Response(json.dumps(resp_data))
  resp.headers['Content-Type'] = 'application/activity+json'
  return resp

@app.route('/u/<username>/outbox', methods=['GET'])
def ap_user_outbox(username):
  page = request.args.get('page')
  min_id = request.args.get('min_id')
  max_id = request.args.get('max_id')
  resp_data = activitypub.outbox(username, page, min_id, max_id)
  resp = Response(json.dumps(resp_data))
  resp.headers['Content-Type'] = 'application/activity+json'
  return resp