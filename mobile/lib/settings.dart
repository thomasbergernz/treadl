import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api.dart';

class SettingsScreen extends StatelessWidget {
  final TextEditingController _passwordController = TextEditingController();
 
  void _logout(BuildContext context) async {
    Api api = Api();
    api.request('POST', '/accounts/logout');
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    prefs.remove('apiToken');
    Navigator.of(context).pushNamedAndRemoveUntil('/welcome', (Route<dynamic> route) => false);
  }

  void _deleteAccount(BuildContext context) async {

    AlertDialog alert = AlertDialog(
      title: Text('Delete your Treadl account'),
      content: Column(children: [
        Text('We will remove your account, along with any projects and items you\'ve created. To continue, please enter your account password.'),
        SizedBox(height: 20),
        TextField(
          controller: _passwordController,
          obscureText: true,
          decoration: InputDecoration(
            hintText: 'Type your password...', labelText: 'Account Password'
          )
        ),
      ]),
      actions: [
        TextButton(
          child: Text('Cancel'),
          onPressed: () { Navigator.of(context).pop(); }
        ),
        ElevatedButton(
          child: Text('Delete Account'),
          onPressed: () async {
            Api api = Api();
            var data = await api.request('DELETE', '/accounts', {'password': _passwordController.text});
            if (data['success'] == true) {
              SharedPreferences prefs = await SharedPreferences.getInstance();
              prefs.remove('apiToken');
              Navigator.of(context).pushNamedAndRemoveUntil('/welcome', (Route<dynamic> route) => false);
            } else {
              showDialog(
                context: context,
                builder: (BuildContext context) => CupertinoAlertDialog(
                  title: new Text('There was a problem with deleting your account'),
                  content: new Text(data['message']),
                  actions: <Widget>[
                    CupertinoDialogAction(
                      isDefaultAction: true,
                      child: Text('OK'),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                )
              );
            }
          }
        ),
      ],
    );

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
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
              Text('Thanks for using Treadl', style: Theme.of(context).textTheme.titleLarge),
          ),
          Container(
            child: Text("Treadl is an app for managing your projects and for keeping in touch with your weaving communities.\n\nWe're always trying to make Treadl better, so if you have any feedback please let us know!", style: Theme.of(context).textTheme.bodyText1)
          ),

          SizedBox(height: 30),
      
          ListTile(
            leading: Icon(Icons.exit_to_app),
            title: Text('Logout'),
            onTap: () => _logout(context),
          ),
          ListTile(
            leading: Icon(Icons.delete),
            title: Text('Delete Account'),
            onTap: () => _deleteAccount(context),
          ),

          SizedBox(height: 30),

          ListTile(
            leading: Icon(Icons.link),
            trailing: Icon(Icons.explore),
            title: Text('Visit Our Website'),
            onTap: () => launch('https://treadl.com'),
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
        ]
      ),
    );
  }
}
