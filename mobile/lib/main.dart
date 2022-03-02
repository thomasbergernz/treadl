import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
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

class MyApp extends StatefulWidget {
  // Create the initialization Future outside of `build`:
  @override
  _AppState createState() => _AppState();
}

class _AppState extends State<MyApp> {
  // See: https://firebase.flutter.dev/docs/overview
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      // Initialize FlutterFire:
      future: _initialization,
      builder: (context, snapshot) {
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
      },
    );
  }
}

class Startup extends StatelessWidget {
  bool _handled = false;

  Startup() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        print(message.notification.body);
        String text = '';
        if (message.notification != null && message.notification.body != null) {
          text = message.notification.body;
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
      }
    });
  }

  void checkToken(BuildContext context) async {
    if (_handled) return;
    _handled = true;
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    final String token = prefs.getString('apiToken');
    if (token != null) {
      Provider.of<Store>(context, listen: false).setToken(token);
      
      FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
      await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      String _pushToken = await _firebaseMessaging.getToken();
      if (_pushToken != null) {
        print("sending push");
        Api api = Api();
        api.request('PUT', '/accounts/pushToken', {'pushToken': _pushToken});
      }
      print('111');  
      // Push without including current route in stack:
      Navigator.of(context, rootNavigator: true).pushNamedAndRemoveUntil('/home', (Route<dynamic> route) => false);
      print('222');
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
