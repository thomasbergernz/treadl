import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'util.dart';
import 'api.dart';
import 'lib.dart';

class _UserScreenState extends State<UserScreen> with SingleTickerProviderStateMixin {
  final String username;
  final Api api = Api();
  TabController? _tabController;
  Map<String,dynamic>? _user;
  bool _loading = false;
  _UserScreenState(this.username) { }

  @override
  initState() {
    super.initState();
    _tabController = new TabController(length: 2, vsync: this);
    getUser(username);
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

  Widget getBody() {
    if (_loading)
      return CircularProgressIndicator();
    else if (_user != null && _tabController != null) {
      var u = _user!;
      String? created;
      if (u['createdAt'] != null) {
        DateTime createdAt = DateTime.parse(u['createdAt']!);
        created = DateFormat('MMMM y').format(createdAt);
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(children: [
            Util.avatarImage(Util.avatarUrl(u), size: 120),
            Container(
              padding: EdgeInsets.only(left: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(u['username'], style: Theme.of(context).textTheme.titleLarge),
                  SizedBox(height: 5),
                  u['location'] != null ?
                    Row(children: [
                      Icon(CupertinoIcons.location),
                      SizedBox(width: 10),
                      Text(u['location'])
                    ]) : SizedBox(height: 1),
                  SizedBox(height: 10),
                  Text('Member' + (created != null ? (' since ' + created!) : ''),
                    style: TextStyle(color: Colors.grey[500])
                  ),
                  SizedBox(height: 10),
                  u['website'] != null ?
                    GestureDetector(
                      onTap: () {
                        String url = u['website'];
                        if (!url.startsWith('http')) {
                          url = 'http://' + url;
                        }
                        launch(url);
                      },
                      child: Text(u['website'],
                        style: TextStyle(color: Colors.pink))
                    ) : SizedBox(height: 1),
                  ]
                )
              )
            ]),
            SizedBox(height: 10),
            TabBar(
              unselectedLabelColor: Colors.black,
              labelColor: Colors.pink,
              tabs: [
                Tab(
                  text: 'Profile',
                  icon: Icon(Icons.person),
                ),
                Tab(
                  text: 'Projects',
                  icon: Icon(Icons.folder),
                )
              ],
              controller: _tabController!,
              indicatorSize: TabBarIndicatorSize.tab,
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: 30),
                      Text(u['bio'] != null ? u['bio'] : 'The user doesn\'t have any more profile information.'),
                    ]
                  ),
                  (u['projects'] != null && u['projects'].length > 0) ?
                    Container(
                      margin: EdgeInsets.only(top: 10),
                      child: GridView.count(
                        crossAxisCount: 2,
                        mainAxisSpacing: 5,
                        crossAxisSpacing: 5,
                        childAspectRatio: 1.3,
                        children: u['projects'].map<Widget>((p) =>
                          ProjectCard(p)               
                        ).toList()
                      ),
                    ) :
                    Container(
                      margin: EdgeInsets.all(10),
                      child: EmptyBox('This user doesn\'t have any public projects'),
                    ),
                ],
              ),
            )
          ]);
    }
    else
      return Text('User not found');
  }

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      appBar: AppBar(
        title: Text(username),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.person),
            onPressed: () {
              launch('https://www.treadl.com/' + username);
            },
          ),
        ]
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        alignment: Alignment.center,
        child: getBody()
      ),
    ); 
  }
}

class UserScreen extends StatefulWidget {
  final String username;
  UserScreen(this.username) { }
  @override
  _UserScreenState createState() => _UserScreenState(username); 
}
