import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'util.dart';
import 'api.dart';

class _UserScreenState extends State<UserScreen> {
  final Util util = new Util();
  final Api api = Api();
  Map<String,dynamic> _user;
  bool _loading = false;
  _UserScreenState(this._user) { }

  @override
  initState() {
    super.initState();
    getUser(_user['username']);
  }

  void getUser(String username) async {
    if (username == null) return;
    setState(() => _loading = true);
    var data = await api.request('GET', '/users/' + username);
    if (data['success'] == true) {
      setState(() {
        _user = data['payload'];
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    String created;
    if (_user['createdAt'] != null) {
      DateTime createdAt = DateTime.parse(_user['createdAt']);
      created = DateFormat('MMMM y').format(createdAt);
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(_user['username']),
      ),
      body: _loading ?
        Container(
          margin: const EdgeInsets.all(10.0),
          alignment: Alignment.center,
          child: CircularProgressIndicator()
        )
      : Container(
        padding: EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(children: [
              util.avatarImage(util.avatarUrl(_user), size: 120),
              Expanded(child: Container(
                padding: EdgeInsets.only(left: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(_user['username'], style: Theme.of(context).textTheme.title),
                    SizedBox(height: 5),
                    _user['location'] != null ?
                      Row(children: [
                        Icon(CupertinoIcons.location),
                        Text(_user['location'])
                      ]) : SizedBox(height: 1),
                    SizedBox(height: 10),
                    Text('Member' + (created != null ? (' since ' + created) : ''),
                      style: TextStyle(color: Colors.grey[500])
                    ),
                    SizedBox(height: 10),
                    _user['website'] != null ?
                      GestureDetector(
                        onTap: () {
                          String url = _user['website'];
                          if (!url.startsWith('http')) {
                            url = 'http://' + url;
                          }
                          launch(url);
                        },
                        child: Text(_user['website'],
                          style: TextStyle(color: Colors.pink))
                      ) : SizedBox(height: 1),
                  ]
                )
              ))
            ]),
            SizedBox(height: 30),
            Text(_user['bio'] != null ? _user['bio'] : '')
          ]
        )
      ),
    ); 
  }
}

class UserScreen extends StatefulWidget {
  final Map<String,dynamic> user;
  UserScreen(this.user) { }
  @override
  _UserScreenState createState() => _UserScreenState(user); 
}
