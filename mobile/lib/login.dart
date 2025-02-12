import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart'; 
import 'package:flutter/widgets.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'model.dart';

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final Api api = Api();
  bool _loggingIn = false;

  void _submit(BuildContext context) async {
    setState(() => _loggingIn = true);
    var data = await api.request('POST', '/accounts/login', {'email': _emailController.text, 'password': _passwordController.text});
    setState(() => _loggingIn = false);
    if (data['success'] == true) {
      AppModel model = Provider.of<AppModel>(context, listen: false);
      await model.setToken(data['payload']['token']);
      context.go('/onboarding');
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
        title: Text('Login to Treadl'),
      ),
      body: Container(
        margin: const EdgeInsets.only(top: 40, left: 10, right: 10),
        child: ListView(
          children: <Widget>[
            Text('Login with your Treadl account', style: TextStyle(fontSize: 20)),
            SizedBox(height: 30),
            TextField(
              autofocus: true,
              controller: _emailController,
              decoration: InputDecoration(
                hintText: 'sam@example.com', labelText: 'Email address or username',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            TextField(
              onEditingComplete: () => _submit(context),
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                hintText: 'Type your password', labelText: 'Your password',
                border: OutlineInputBorder(),
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
            ElevatedButton(
              onPressed: () => _submit(context),
              child: _loggingIn ? SizedBox(height: 20, width: 20, child:CircularProgressIndicator(backgroundColor: Colors.white)) : Text("Login",
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

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState(); 
}
