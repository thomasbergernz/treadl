import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart'; 
import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'api.dart';

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final Api api = Api();
  bool _loggingIn = false;

  void _submit(context) async {
    setState(() => _loggingIn = true);
    var data = await api.request('POST', '/accounts/login', {'email': _emailController.text, 'password': _passwordController.text});
    setState(() => _loggingIn = false);
    if (data['success'] == true) {
      String token = data['payload']['token'];
      SharedPreferences prefs = await SharedPreferences.getInstance();      
      prefs.setString('apiToken', token);
      Navigator.of(context).pushNamedAndRemoveUntil('/onboarding', (Route<dynamic> route) => false);
    }
    else {
      showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
          title: new Text("There was a problem logging you in"),
          content: new Text(data['message']),
          actions: <Widget>[
            CupertinoDialogAction(
              isDefaultAction: true,
              child: Text('Try again'),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        )
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login to Treadl'),
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Image(image: AssetImage('assets/logo.png'), width: 100),
              SizedBox(height: 20),
              Text('Login using your Treadl account.'),
              SizedBox(height: 20),
              TextField(
                autofocus: true,
                controller: _emailController,
                decoration: InputDecoration(
                  hintText: 'sam@example.com', labelText: 'Email address or username'
                ),
              ),
              SizedBox(height: 10),
              TextField(
                onEditingComplete: () => _submit(context),
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Type your password', labelText: 'Your password'
                ),
              ),
              SizedBox(height: 5),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [GestureDetector(
                  onTap: () => launch('https://treadl.com/password/forgotten'),
                  child: Text('Forgotten your password?'),
                )]
              ),
              SizedBox(height: 20),
              RaisedButton(
                onPressed: () => _submit(context),
                color: Colors.pink,
                child: _loggingIn ? SizedBox(height: 20, width: 20, child:CircularProgressIndicator(backgroundColor: Colors.white)) : Text("Login",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontSize: 15)
                )
              ),
            ]
          )
        )
      ),
    ); 
  }
}

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState(); 
}
