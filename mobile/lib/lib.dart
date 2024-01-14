import 'dart:core';
import 'package:flutter/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'util.dart';
import 'user.dart';
import 'object.dart';
import 'project.dart';

class Alert extends StatelessWidget {
  final String type;
  final String title;
  final String description;
  final String actionText;
  final Widget? descriptionWidget;
  final Function? action;
  Alert({this.type = 'info', this.title = '', this.description = '', this.descriptionWidget = null, this.actionText = 'Click here', this.action}) {}

  @override
  Widget build(BuildContext context) {
    var color = Colors.blue;
    var accentColor = Colors.blue[50];
    var icon = CupertinoIcons.info;
    if (type == 'success') {
      color = Colors.green;
      accentColor = Colors.green[50];
      icon = CupertinoIcons.check_mark_circled;
    }
    if (type == 'failure') {
      color = Colors.red;
      accentColor = Colors.red[50];
      icon = CupertinoIcons.clear_circled;
    }
    return Container(
      padding: EdgeInsets.all(15),
      margin: EdgeInsets.all(15),
      decoration: new BoxDecoration(
        color: accentColor,
        borderRadius: new BorderRadius.all(Radius.circular(10.0)),
        boxShadow: [
          BoxShadow(color: Colors.grey[50]!, spreadRadius: 5),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, color: color),
          SizedBox(height: 20),
          Text(description, textAlign: TextAlign.center),
          descriptionWidget != null ? descriptionWidget! : Text(""),
          action != null ? CupertinoButton(
            child: Text(actionText),
            onPressed: () => action!(),
          ) : Text("")
        ]
      )
    );
  }
}

class NoticeboardPost extends StatefulWidget {
  final Map<String,dynamic> _entry;
  final Function? onDelete;
  final Function? onReply;
  NoticeboardPost(this._entry, {this.onDelete = null, this.onReply = null});
  _NoticeboardPostState createState() => _NoticeboardPostState(_entry, onDelete: onDelete, onReply: onReply);
}
class _NoticeboardPostState extends State<NoticeboardPost> {
  final Map<String,dynamic> _entry;
  final Util utils = new Util();
  final Api api = new Api();
  final Function? onDelete;
  final Function? onReply;
  final TextEditingController _replyController = TextEditingController();
  bool _isReplying = false;
  bool _replying = false;

  _NoticeboardPostState(this._entry, {this.onDelete = null, this.onReply = null}) { }

  void _sendReply() async {
    setState(() => _replying = true);
    var data = await api.request('POST', '/groups/' + _entry['group'] + '/entries/' + _entry['_id'] + '/replies', {'content': _replyController.text});
    if (data['success'] == true) {
      _replyController.value = TextEditingValue(text: '');
      FocusScope.of(context).requestFocus(FocusNode());
      if (onReply != null) {
        onReply!(data['payload']);
      }
      setState(() {
        _replying = false;
        _isReplying = false;
      });
    }
  }

  void _deletePost() async {
    var data = await api.request('DELETE', '/groups/' + _entry['group'] + '/entries/' + _entry['_id']);
    if (data['success'] == true) {
      if (onDelete != null) {
        onDelete!(_entry);
      }
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    var createdAt = DateTime.parse(_entry['createdAt']);
    bool isReply = _entry['inReplyTo'] != null;
    int replyCount = _entry['replies'] == null ? 0 : _entry['replies']!.length;
    String replyText = 'Write a reply...';
    if (replyCount == 1) replyText = '1 Reply';
    if (replyCount > 1) replyText = replyCount.toString() + ' replies';
    if (_isReplying) replyText = 'Cancel reply';
    List<Widget> replyWidgets = [];
    if (_entry['replies'] != null) {
      for (int i = 0; i < _entry['replies']!.length; i++) {
        replyWidgets.add(new Container(
          key: Key(_entry['replies']![i]['_id']),
          child: NoticeboardPost(_entry['replies']![i], onDelete: onDelete)
        ));
      }
    }
    return new GestureDetector(
      key: Key(_entry['_id']),
      onLongPress: () async {
        Dialog simpleDialog = Dialog(
          child: Container(
            height: 160.0,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                ElevatedButton(
                  //color: Colors.orange,
                  onPressed: () {
                    launch('https://www.treadl.com');
                  },
                  child: Text('Report this post'),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  //color: Colors.red,
                  onPressed: _deletePost,
                  child: Text('Delete post'),
                ),
                TextButton(
                  onPressed: () {
                    context.pop();
                  },
                  child: Text('Cancel'),
                )
              ],
            ),
          ),
        );
        showDialog(context: context, builder: (BuildContext context) => simpleDialog);
      },
      child: Container(
        color: Colors.grey[200],
        padding: EdgeInsets.only(top: 7, bottom: 7, right: 7, left: isReply ? 30 : 7),
        margin: EdgeInsets.only(bottom: isReply ? 0 : 20, top: isReply ? 5 : 0),
        child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              GestureDetector(
                onTap: () => context.push('/' + _entry['authorUser']['username']),
                child: utils.avatarImage(utils.avatarUrl(_entry['authorUser']), size: isReply ? 30 : 40)
              ),
              SizedBox(width: 5),
              Text(_entry['authorUser']['username'], style: TextStyle(color: Colors.pink)),
              SizedBox(width: 5),
              Text(DateFormat('kk:mm on MMMM d y').format(createdAt), style: TextStyle(color: Colors.grey, fontSize: 10)),
              SizedBox(width: 10),
              !isReply ? GestureDetector(
                onTap: () => setState(() => _isReplying = !_isReplying),
                child: Text(replyText, style: TextStyle(color: replyCount > 0 ? Colors.pink : Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
              ): SizedBox(width: 0),
            ],
          ),
          Row(children: [
            SizedBox(width: 45),
            Expanded(child: Text(_entry['content'], textAlign: TextAlign.left))
          ]),
          _isReplying ? NoticeboardInput(_replyController, _sendReply, _replying, label: 'Reply to this post') : SizedBox(width: 0),
          Column(
            children: replyWidgets
          ),
        ],
      ))
    );
  }
}

class NoticeboardInput extends StatelessWidget {
  final TextEditingController _controller;
  final Function _onPost;
  final bool _posting;
  final String label;
  NoticeboardInput(this._controller, this._onPost, this._posting, {this.label = 'Write a new post'}) {}

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(7),
      child: Row(
        children: [
          Expanded(child: TextField(
            controller: _controller,
            maxLines: 8,
            minLines: 1,
            decoration: InputDecoration(
              hintText: 'Begin writing...', labelText: label
            ),
          )),
          IconButton(
            onPressed: () => _onPost!(),
            color: Colors.pink,
            icon: _posting ? CircularProgressIndicator() : Icon(Icons.send),
          )
        ]
      ),
    );
  }
}

class UserChip extends StatelessWidget {
  final Map<String,dynamic> user;
  final Util utils = new Util();
  UserChip(this.user) {}

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/' + user['username']),
      child: Row(
        children: [
          utils.avatarImage(utils.avatarUrl(user), size: 20),
          SizedBox(width: 5),
          Text(user['username'], style: TextStyle(color: Colors.grey))
        ]
      )
    );
  }
}

class PatternCard extends StatelessWidget {
  final Map<String,dynamic> object;
  PatternCard(this.object) {}

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      clipBehavior: Clip.hardEdge,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(6.0),
      ),
      child: InkWell(
        onTap: () {
          context.push('/' + object['userObject']['username'] + '/' + object['projectObject']['path'] + '/' + object['_id']);
        },
        child: Column(
          children: [
            Container(
              height: 100,
              decoration: BoxDecoration(
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: NetworkImage(object['previewUrl']),
                ),
              ),
            ),
            Container(
              padding: EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  UserChip(object['userObject']),
                  SizedBox(height: 5),
                  Text(Util.ellipsis(object['name'], 35), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ]
              )
            )
          ]
        )
      )
    );
  }
}

class ProjectCard extends StatelessWidget {
  final Map<String,dynamic> project;
  ProjectCard(this.project) {}

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      clipBehavior: Clip.hardEdge,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(6.0),
      ),
      child: InkWell(
        onTap: () {
          context.push('/' + this.project['owner']['username'] + '/' + this.project['path']);
        },
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.folder),
                  SizedBox(height: 10),
                  UserChip(project['owner']),
                  SizedBox(height: 5),
                  Text(Util.ellipsis(project['name'], 35), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ]
              )
            )
          ]
        )
      )
    );
  }
}

class CustomText extends StatelessWidget {
  final String text;
  final String type;
  final double margin;
  TextStyle? style;
  CustomText(this.text, this.type, {this.margin = 0}) {
    if (this.type == 'h1') {
      style = TextStyle(fontSize: 30, fontWeight: FontWeight.bold);
    }
    else {
      style = TextStyle();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(this.margin), 
      child: Text(text, style: style)
    );
  }
}

class LoginNeeded extends StatelessWidget {
  final String? text;
  LoginNeeded({this.text}) {}
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('You need to login to see this', style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
        Image(image: AssetImage('assets/login.png'), width: 300),
        text != null ? Text(text!, textAlign: TextAlign.center) : SizedBox(height: 10),
        CupertinoButton(
          onPressed: () {
            context.push('/welcome');
          },
          child: new Text("Login or register",
            textAlign: TextAlign.center,
          )
        )
      ]
    );
  }
}

class EmptyBox extends StatelessWidget {
  final String title;
  final String? description;

  EmptyBox(this.title, {this.description}) {}

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(title, style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
        Image(image: AssetImage('assets/empty.png'), width: 300),
        description != null ? Text('Add a pattern file, an image, or something else to this project using the + button below.', textAlign: TextAlign.center) : SizedBox(height: 0),
    ]);
  }
}
