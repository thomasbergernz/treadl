import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'api.dart';
import 'group_noticeboard.dart';
import 'group_members.dart';

class _GroupScreenState extends State<GroupScreen> with SingleTickerProviderStateMixin {
  TabController _controller;
  final Map<String,dynamic> _group;
  _GroupScreenState(this._group) {
    _controller=TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_group['name']),
      ),
      bottomNavigationBar: Material (
        child: TabBar(
          tabs: <Tab> [
            Tab(text: 'Notice board', icon: Icon(Icons.speaker_notes)),
            Tab(text: 'Members', icon: Icon(Icons.people)),
          ],
          controller: _controller,
        ),
        color: Colors.black,
      ),
      body: TabBarView(
        children: <Widget>[
          GroupNoticeBoardTab(_group),
          GroupMembersTab(_group)
        ],
        controller: _controller,
      ),
    ); 
  }
}

class GroupScreen extends StatefulWidget {
  final Map<String,dynamic> group;
  GroupScreen(this.group) { }
  @override
  _GroupScreenState createState() => _GroupScreenState(group); 
}
