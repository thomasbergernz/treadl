import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'api.dart';
import 'group_noticeboard.dart';
import 'group_members.dart';

class _GroupScreenState extends State<GroupScreen> {
  int _selectedIndex = 0;
  List<Widget> _widgetOptions = <Widget> [];
  final Map<String, dynamic> _group;

  _GroupScreenState(this._group) {
    _widgetOptions = <Widget> [
      GroupNoticeBoardTab(this._group),
      GroupMembersTab(this._group)
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_group['name'])
      ),
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
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
        onTap: _onItemTapped,
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
