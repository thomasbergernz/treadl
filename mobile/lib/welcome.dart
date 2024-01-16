import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'login.dart';

class WelcomeScreen extends StatelessWidget {
  void _login(BuildContext context) {
    context.push('/login');
  }
  void _register(BuildContext context) {
    context.push('/register');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(color: Colors.pink,
      padding: EdgeInsets.only(top: 20, bottom: 20, left: 10, right: 10),
      child: Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Image(image: AssetImage('assets/logo_light.png'), width: 150),
          SizedBox(height: 30),
          Text('Welcome', style: TextStyle(color: Colors.white, fontSize: 30)),
          SizedBox(height: 10),
          Text('Treadl is a place for weavers to connect and manage their portfolios.', style: TextStyle(color: Colors.white), textAlign: TextAlign.center),
          SizedBox(height: 30),
          CupertinoButton(
            onPressed: () => _login(context),
            color: Colors.white,
            child: new Text("Login",
              style: TextStyle(color: Colors.pink),
              textAlign: TextAlign.center,
            )
          ),
          SizedBox(height: 15),
          CupertinoButton(
            onPressed: () => _register(context),
            color: Colors.pink[400],
            child: new Text("Register",
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            )
          ),
          SizedBox(height: 35),
          CupertinoButton(
            onPressed: () => context.pop(),
            child: new Text("Cancel",
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            )
          ),
        ]),
      ))
    );
  }
}
