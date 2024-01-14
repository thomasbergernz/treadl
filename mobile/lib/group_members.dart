import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'util.dart';
import 'user.dart';

class _GroupMembersTabState extends State<GroupMembersTab> {
  final Util util = new Util();
  final Map<String,dynamic> _group;
  final Api api = Api();
  List<dynamic> _members = [];
  bool _loading = false;
  
  _GroupMembersTabState(this._group) { }

  @override
  initState() {
    super.initState();
    getMembers(_group['_id']);
  }

  void getMembers(String id) async {
    setState(() => _loading = true);
    var data = await api.request('GET', '/groups/' + id + '/members');
    if (data['success'] == true) {
      setState(() {
        _members = data['payload']['members'];
        _loading = false;
      });
    }
  }

  Widget getMemberCard(member) {
    return new ListTile(
      onTap: () => context.push('/' + member['username']),
      leading: util.avatarImage(util.avatarUrl(member), size: 40),
      trailing: Icon(Icons.keyboard_arrow_right),
      title: Text(member['username'])
    );
  }

  @override
  Widget build(BuildContext context) {
    return _loading ?
      Container(
        margin: const EdgeInsets.all(10.0),
        alignment: Alignment.center,
        child: CircularProgressIndicator()
      )
    :Column(
      children: [
        Container(
          child: Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _members.length,
              itemBuilder: (BuildContext context, int index) {
                return getMemberCard(_members[index]);
              },
            ),
          ),
	)
      ]
    ); 
  }
}

class GroupMembersTab extends StatefulWidget {
  final Map<String,dynamic> group;
  GroupMembersTab(this.group) { }
  @override
  _GroupMembersTabState createState() => _GroupMembersTabState(group); 
}
