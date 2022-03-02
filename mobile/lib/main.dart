import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'api.dart';
import 'store.dart';
import 'welcome.dart';
import 'login.dart';
import 'register.dart';
import 'onboarding.dart';
import 'home.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => Store(),
      child: MyApp()
    )
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Treadl',
      theme: ThemeData(
        primarySwatch: Colors.pink,
        textSelectionColor: Colors.blue,
      ),   
      home: Startup(),
      routes: <String, WidgetBuilder>{
        '/welcome': (BuildContext context) => WelcomeScreen(),
        '/login': (BuildContext context) => LoginScreen(),
        '/register': (BuildContext context) => RegisterScreen(),
        '/onboarding': (BuildContext context) => OnboardingScreen(),
        '/home': (BuildContext context) => HomeScreen(),
      }
    );
  }
}

class Startup extends StatelessWidget {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging(); 
  bool _loggedIn = false;

  Startup() {
    _setupFirebase();
  }

  void _setupFirebase() async {
    _firebaseMessaging.configure(
      onMessage: (Map<String, dynamic> message) async {
        print(message['notification']['body']);
        String text = '';
        if (message['notification'] != null) {
          if (message['notification']['title'] != null) {
            text += message['notification']['title'] + ': ';
          }
          if (message['notification']['body'] != null) {
            text += message['notification']['body'];
          }
        }
	Fluttertoast.showToast(
          msg: text,
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 10,
          backgroundColor: Colors.grey[100],
          textColor: Colors.black,
          fontSize: 16.0
        );
      },
    );
  }

  void checkToken(BuildContext context) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    final String token = prefs.getString('apiToken');
    if (token != null) {
      _loggedIn = true;
      Provider.of<Store>(context, listen: false).setToken(token);
      await _firebaseMessaging.requestNotificationPermissions(
        const IosNotificationSettings(sound: true, badge: true, alert: true, provisional: false),
      );
      String _pushToken = await _firebaseMessaging.getToken();
      if (_pushToken != null) {
        print("sending push");
        Api api = Api();
        api.request('PUT', '/accounts/pushToken', {'pushToken': _pushToken});
      }
      
      // Push without including current route in stack:
      Navigator.of(context).pushNamedAndRemoveUntil('/home', (Route<dynamic> route) => false);
    } else {
      Navigator.of(context).pushNamedAndRemoveUntil('/welcome', (Route<dynamic> route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    checkToken(context);
    return Container();
  }
}
