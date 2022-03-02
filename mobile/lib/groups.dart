import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'group.dart';
import 'api.dart';

class _GroupsTabState extends State<GroupsTab> {
  List<dynamic> _groups = [];
  bool _loading = false;

  @override
  initState() {
    super.initState();
    getGroups();
  }

  void getGroups() async {
    setState(() => _loading = true);
    Api api = Api();
    var data = await api.request('GET', '/groups');
    if (data['success'] == true) {
      setState(() {
        _groups = data['payload']['groups'];
        _loading = false;
      });
    }
  }

  Widget buildGroupCard(Map<String,dynamic> group) {
    String description = group['description'];
    if (description != null && description.length > 80) {
      description = description.substring(0, 77) + '...';
    } else {
      description = '';
    }
    return Card(
        child: InkWell(
          onTap: () {
            Navigator.push(
	      context,
              MaterialPageRoute(
                builder: (context) => GroupScreen(group),
              ),
            );
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              new ListTile(
                leading: Icon(Icons.people),
                trailing: Icon(Icons.keyboard_arrow_right),
                title: Text(group['name']),
                subtitle: Text(description.replaceAll("\n", " ")),
              ),
            ]
          )
        )
      )
    ;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Groups'),
      ),
      body: _loading ?
        Container(
          margin: const EdgeInsets.all(10.0),
          alignment: Alignment.center,
          child: CircularProgressIndicator()
        )
      : Container(
        margin: const EdgeInsets.all(10.0),
        child: (_groups != null && _groups.length > 0) ? 
          ListView.builder(
            itemCount: _groups.length,
            itemBuilder: (BuildContext context, int index) {
              return buildGroupCard(_groups[index]);
            },
          )
        :
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('You aren\'t a member of any groups yet', style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
              Image(image: AssetImage('assets/group.png'), width: 300),
              Text('Groups let you meet and keep in touch with others in the weaving community.', textAlign: TextAlign.center),
              Text('Please use our website to join and leave groups.', textAlign: TextAlign.center),
          ])
      ),
    ); 
  }
}

class GroupsTab extends StatefulWidget {
  @override
  _GroupsTabState createState() => _GroupsTabState(); 
}
