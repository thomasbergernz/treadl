import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'api.dart';
import 'user.dart';
import 'lib.dart';

class _GroupNoticeBoardTabState extends State<GroupNoticeBoardTab> {
  final TextEditingController _newEntryController = TextEditingController();
  final Api api = Api();
  Map<String,dynamic> _group;
  List<dynamic> _entries = [];
  bool showPostButton = false;
  bool _loading = false; 
  bool _posting = false;
  
  _GroupNoticeBoardTabState(this._group) { }

  @override
  initState() {
    super.initState();
    getEntries(_group['_id']);
    _newEntryController.addListener(() {
      setState(() {
        showPostButton = _newEntryController.text.length > 0 ? true : false;
      });
    });
  }

  void getEntries(String id) async {
    setState(() => _loading = true);
    var data = await api.request('GET', '/groups/' + id + '/entries');
    if (data['success'] == true) {
      setState(() {
        _entries = data['payload']['entries'];
        _loading = false;
      });
    }
  }

  void _sendPost(context) async {
    setState(() => _posting = true);
    var data = await api.request('POST', '/groups/' + _group['_id'] + '/entries', {'content': _newEntryController.text});
    if (data['success'] == true) {
      _newEntryController.value = TextEditingValue(text: '');
      FocusScope.of(context).requestFocus(FocusNode());
      var newEntries = _entries;
      newEntries.insert(0, data['payload']);
      setState(() {
        _entries = newEntries;
        _posting = false;
      });
    }
  }

  void _onReply(entry) async {
    var newEntries = _entries;
    newEntries.insert(0, entry);
    setState(() {
      _entries = newEntries;
    });
  }

  void _onDelete(entry) async {
    setState(() {
      _entries.remove(entry);
    });
  }

  @override
  Widget build(BuildContext context) {
    var entries = _entries.where((e) => e['inReplyTo'] == null).toList();
    var replies = _entries.where((e) => e['inReplyTo'] != null).toList();
    for (int i = 0; i < entries.length; i++) {
      entries[i]['replies'] = [];
      for (int j = 0; j < replies.length; j++) {
        if (replies[j]['inReplyTo'] == entries[i]['_id']) {
          entries[i]['replies'].add(replies[j]); 
        }
      }
    }
    return Column(
      children: <Widget>[
        NoticeboardInput(_newEntryController, () => _sendPost(context), _posting, label: 'Write a new post to the group'),
        Container(
          child: Expanded(
            child: _loading ?
              Container(
                margin: const EdgeInsets.all(10.0),
                alignment: Alignment.center,
                child: CircularProgressIndicator()
              )
            :
              ListView.builder(
              padding: const EdgeInsets.all(0),
              itemCount: entries.length,
              itemBuilder: (BuildContext context, int index) {
                return Container(
                  key: Key(entries[index]['_id']),
                  child: NoticeboardPost(entries[index],
                  onDelete: _onDelete,
                  onReply: _onReply,
                ));
              },
            ),
          )
        )
      ]
    ); 
  }
}

class GroupNoticeBoardTab extends StatefulWidget {
  final Map<String,dynamic> group;
  GroupNoticeBoardTab(this.group) { }
  @override
  _GroupNoticeBoardTabState createState() => _GroupNoticeBoardTabState(group); 
}
