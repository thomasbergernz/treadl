import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart'; 
import 'package:flutter/gestures.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'model.dart';

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final Api api = Api();
  bool _registering = false;

  void _submit(context) async {
    setState(() => _registering = true);
    var data = await api.request('POST', '/accounts/register', {'username': _usernameController.text, 'email': _emailController.text, 'password': _passwordController.text});
    setState(() => _registering = false);
    if (data['success'] == true) {
      AppModel model = Provider.of<AppModel>(context, listen: false);
      model.setToken(data['payload']['token']);
      context.go('/onboarding');
    }
    else {
      showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
          title: new Text("There was a problem registering your account"),
          content: new Text(data['message']),
          actions: <Widget>[
            CupertinoDialogAction(
              isDefaultAction: true,
              child: Text('Try again'),
              onPressed: () => context.pop(),
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
        title: Text('Register with Treadl'),
      ),
      body: Container(
        margin: const EdgeInsets.only(top: 40, left: 10, right: 10),
        child: ListView(
          children: <Widget>[
            TextField(
              autofocus: true,
              controller: _usernameController,
              decoration: InputDecoration(
                hintText: 'username', labelText: 'Choose a username',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                hintText: 'sam@example.com', labelText: 'Your email address', helperText: 'For notifications & password resets - we never share this.',
                border: OutlineInputBorder()
              ),
            ),
            SizedBox(height: 10),
            TextField(
              onEditingComplete: () => _submit(context),
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                hintText: 'Type your password', labelText: 'Choose a strong password',
                border: OutlineInputBorder()
              ),
            ),
            SizedBox(height: 20),
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                text: 'By registering you agree to Treadl\'s ',
                style: Theme.of(context).textTheme.bodyText1,
                children: <TextSpan>[
                  TextSpan(text: 'Terms of Use', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.pink), recognizer: new TapGestureRecognizer()..onTap = () => launch('https://treadl.com/terms-of-use')),
                  TextSpan(text: ' and '),
                  TextSpan(text: 'Privacy Policy', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.pink), recognizer: new TapGestureRecognizer()..onTap = () => launch('https://treadl.com/privacy')),
                  TextSpan(text: '.'),
                ],
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _submit(context),
              //color: Colors.pink,
              child: _registering ? SizedBox(height: 20, width: 20, child:CircularProgressIndicator(backgroundColor: Colors.white)) : Text("Register",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 15)
              )
            ),
          ]
        )
      ),
    ); 
  }
}

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState(); 
}
