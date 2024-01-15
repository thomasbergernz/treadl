import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:go_router/go_router.dart';
//import 'package:fluttertoast/fluttertoast.dart';
import 'api.dart';
import 'model.dart';
import 'welcome.dart';
import 'login.dart';
import 'register.dart';
import 'onboarding.dart';
import 'home.dart';
import 'project.dart';
import 'object.dart';
import 'settings.dart';
import 'group.dart';
import 'user.dart';

final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => Startup()),
    GoRoute(path: '/welcome', pageBuilder: (context, state) {
      return CustomTransitionPage(
        key: state.pageKey,
        child: WelcomeScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          // Change the opacity of the screen using a Curve based on the the animation's value
          return FadeTransition(
            opacity:
                CurveTween(curve: Curves.easeInOutCirc).animate(animation),
            child: child,
          );
        },
      );
    }),
    GoRoute(path: '/login', builder: (context, state) => LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => RegisterScreen()),
    GoRoute(path: '/onboarding', builder: (context, state) => OnboardingScreen()),
    GoRoute(path: '/home', builder: (context, state) => HomeScreen()),
    GoRoute(path: '/settings', builder: (context, state) => SettingsScreen()),
    GoRoute(path: '/groups/:id', builder: (context, state) => GroupScreen(state.pathParameters['id']!)),
    GoRoute(path: '/:username', builder: (context, state) => UserScreen(state.pathParameters['username']!)),
    GoRoute(path: '/:username/:path', builder: (context, state) => ProjectScreen(state.pathParameters['username']!, state.pathParameters['path']!)),
    GoRoute(path: '/:username/:path/:id', builder: (context, state) => ObjectScreen(state.pathParameters['username']!, state.pathParameters['path']!, state.pathParameters['id']!)),
  ],
);

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AppModel(),
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
        return MaterialApp.router(
          routerConfig: router,
          debugShowCheckedModeBanner: false,
          title: 'Treadl',
          theme: ThemeData(
            primarySwatch: Colors.pink,
            scaffoldBackgroundColor: Color.fromRGBO(255, 251, 248, 1),
          ),   
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
        print(message.notification!);
        String text = '';
        if (message.notification != null && message.notification!.body != null) {
          text = message.notification!.body!;
        }
        /*Fluttertoast.showToast(
          msg: text,
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 10,
          backgroundColor: Colors.grey[100],
          textColor: Colors.black,
          fontSize: 16.0
        );*/
      }
    });
  }

  void checkToken(BuildContext context) async {
    if (_handled) return;
    _handled = true;
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    String? token = prefs.getString('apiToken');
    if (token != null) {
      AppModel model = Provider.of<AppModel>(context, listen: false);
      await model.setToken(token!);
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
      String? _pushToken = await _firebaseMessaging.getToken();
      if (_pushToken != null) {
        print("sending push");
        Api api = Api();
        api.request('PUT', '/accounts/pushToken', {'pushToken': _pushToken!});
      }
    }
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    checkToken(context);
    return Container();
  }
}
