import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api.dart';

class SettingsScreen extends StatelessWidget {
 
  void _logout(BuildContext context) async {
    Api api = Api();
    api.request('POST', '/accounts/logout');
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    prefs.remove('apiToken');
    Navigator.of(context).pushNamedAndRemoveUntil('/welcome', (Route<dynamic> route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('About Treadl'),
      ),
      body:ListView(
        padding: const EdgeInsets.all(8),
        children: <Widget>[
          Container(
            margin: const EdgeInsets.only(top: 10.0, bottom: 10.0),
            child: 
              Text('Thanks for using Treadl', style: Theme.of(context).textTheme.title),
          ),
          Container(
            child: Text("Treadl is an app for managing your projects and for keeping in touch with your weaving communities.\n\nWe're always trying to make Treadl better for our users, so if you have any feedback please let us know!", style: Theme.of(context).textTheme.body1)
          ),
          Container(
            margin: const EdgeInsets.only(top: 10.0, bottom: 20.0),
            child: RaisedButton(
              onPressed: () => launch('https://twitter.com/treadlhq'),
              child: new Text("Follow us on Twitter",
                textAlign: TextAlign.center,
              )
            )
          ),
          Container(
            margin: const EdgeInsets.only(top: 10.0, bottom: 10.0),
            child: 
              Text('Open development', style: Theme.of(context).textTheme.title),
          ),
          Container(
            child: Text("We develop Treadl with an open roadmap, inviting comments and suggestions for upcoming features.", style: Theme.of(context).textTheme.body1)
          ),
          Container(
            margin: const EdgeInsets.only(top: 10.0, bottom: 20.0),
            child: RaisedButton(
              onPressed: () => launch('https://www.notion.so/ddc7dbc3520b49a0ade2994adbaf27dc?v=9a6e74b785fb403689030a4cabd8122c'),
              child: new Text("View roadmap",
                textAlign: TextAlign.center,
              )
            )
          ),
      
          ListTile(
            leading: Icon(Icons.exit_to_app),
            title: Text('Logout'),
            onTap: () => _logout(context),
          ),
          ListTile(
            leading: Icon(Icons.insert_drive_file),
            trailing: Icon(Icons.explore),
            title: Text('Terms of Use'),
            onTap: () => launch('https://treadl.com/terms-of-use'),
          ),
          ListTile(
            leading: Icon(Icons.insert_drive_file),
            trailing: Icon(Icons.explore),
            title: Text('Privacy Policy'),
            onTap: () => launch('https://treadl.com/privacy'),
          ),
          SizedBox(height: 30),
          Text('Copyright 2020 Seastorm Limited',textAlign: TextAlign.center)
        ]
      ),
    );
  }
}
