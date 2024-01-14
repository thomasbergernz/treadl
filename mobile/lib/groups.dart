import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'model.dart';
import 'lib.dart';

class _GroupsTabState extends State<GroupsTab> {
  List<dynamic> _groups = [];
  bool _loading = false;

  @override
  initState() {
    super.initState();
    getGroups();
  }

  void getGroups() async {
    AppModel model = Provider.of<AppModel>(context, listen: false);
    if (model.user == null) return;
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
    String? description = group['description'];
    if (description != null && description.length > 80) {
      description = description.substring(0, 77) + '...';
    } else {
      description = '';
    }
    return Card(
        child: InkWell(
          onTap: () => context.push('/groups/' + group['_id']),
          child: ListTile(
            leading: Icon(Icons.people),
            trailing: Icon(Icons.keyboard_arrow_right),
            title: Text(group['name']),
            subtitle: Text(description.replaceAll("\n", " ")),
          )
        )
      )
    ;
  }

  Widget getBody() {
    AppModel model = Provider.of<AppModel>(context);
    if (model.user == null)
      return LoginNeeded(text: 'Once logged in, you\'ll find your groups here.');
    else if (_loading)
      return CircularProgressIndicator();
    else if (_groups != null && _groups.length > 0)
      return ListView.builder(
        itemCount: _groups.length,
        itemBuilder: (BuildContext context, int index) {
          return buildGroupCard(_groups[index]);
        },
      );
    else
      return Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('You aren\'t a member of any groups yet', style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
          Image(image: AssetImage('assets/group.png'), width: 300),
          Text('Groups let you meet and keep in touch with others in the weaving community.', textAlign: TextAlign.center),
          Text('Please use our website to join and leave groups.', textAlign: TextAlign.center),
      ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Groups'),
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        alignment: Alignment.center,
        child: getBody()
      )
    ); 
  }
}

class GroupsTab extends StatefulWidget {
  @override
  _GroupsTabState createState() => _GroupsTabState(); 
}
