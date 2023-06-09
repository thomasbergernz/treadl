import 'dart:core';
import 'package:flutter/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'api.dart';
import 'util.dart';
import 'user.dart';

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
      Navigator.of(context).pop();
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
                    Navigator.of(context).pop();
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
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(
                    builder: (context) => UserScreen(_entry['authorUser']),
                  ));
                },
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

