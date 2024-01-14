import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'api.dart';
import 'group_noticeboard.dart';
import 'group_members.dart';

class _GroupScreenState extends State<GroupScreen> {
  final String id;
  Map<String, dynamic>? _group;
  int _selectedIndex = 0;

  _GroupScreenState(this.id) { }

  @override
  void initState() {
    fetchGroup();
    super.initState();
  }

  void fetchGroup() async {
    Api api = Api();
    var data = await api.request('GET', '/groups/' + id);
    if (data['success'] == true) {
      setState(() {
        _group = data['payload'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_group?['name'] ?? 'Group')
      ),
      body: Center(
        child: _group != null ?
          [
            GroupNoticeBoardTab(_group!),
            GroupMembersTab(_group!)
          ].elementAt(_selectedIndex)
        : CircularProgressIndicator(),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.speaker_notes),
            label: 'Notice Board',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Members',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.pink[600],
        onTap: (int index) => setState(() {
          _selectedIndex = index;
        }),
      ),
    );
  }
}

class GroupScreen extends StatefulWidget {
  final String id;
  GroupScreen(this.id) { }
  @override
  _GroupScreenState createState() => _GroupScreenState(id); 
}
