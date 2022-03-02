import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api.dart';

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController(
    initialPage: 0,
  );
  final Api api = Api();
  bool _loading = false;
  String _pushToken;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _requestPushPermissions() async {
    setState(() => _loading = true);
    final FirebaseMessaging _firebaseMessaging = FirebaseMessaging();
    await _firebaseMessaging.requestNotificationPermissions(
      const IosNotificationSettings(sound: true, badge: true, alert: true, provisional: false),
    );
    _pushToken = await _firebaseMessaging.getToken();
    if (_pushToken != null) {
      api.request('PUT', '/accounts/pushToken', {'pushToken': _pushToken});
    }
    setState(() => _loading = false);
    _controller.animateToPage(2, duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _controller,
        children: [
          Container(
            color: Colors.pink,
            padding: const EdgeInsets.all(10.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Text('Thanks for joining us! 🎉', style: TextStyle(color: Colors.white, fontSize: 20), textAlign: TextAlign.center),
                SizedBox(height: 10),
                Text('Treadl is a free and safe place for you to build your weaving projects.', style: TextStyle(color: Colors.white, fontSize: 15), textAlign: TextAlign.center),
                SizedBox(height: 10),
                Image(image: AssetImage('assets/folder.png'), width: 300),
                SizedBox(height: 10),
                Text('You can create as many projects as you like. Upload weaving draft patterns, images, and other files to your projects to store and showcase your work.', style: TextStyle(color: Colors.white, fontSize: 13), textAlign: TextAlign.center),
                SizedBox(height: 10),
                RaisedButton(
                  child: Text('OK, I know what projects are!'),
                  onPressed: () => _controller.animateToPage(1, duration: Duration(milliseconds: 500), curve: Curves.easeInOut),
                )
              ]
            )
          ),
          Container(
            color: Colors.pink,
            padding: const EdgeInsets.all(10.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text('Treadl also offers "groups" - spaces for you to meet new people and keep in touch with others in your weaving community.', style: TextStyle(color: Colors.white, fontSize: 15), textAlign: TextAlign.center),
                SizedBox(height: 10),
                Image(image: AssetImage('assets/chat.png'), width: 300),
                SizedBox(height: 10),
                Text('Use groups for your classes, shared interest groups, or whatever you like!', style: TextStyle(color: Colors.white, fontSize: 13), textAlign: TextAlign.center),
                SizedBox(height: 10),
                Text('We recommend enabling push notifications so you can keep up-to-date with your groups and projects.', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                SizedBox(height: 10),
                RaisedButton(
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    _loading ? CircularProgressIndicator() : null,
                    _loading ? SizedBox(width: 5) : null,
                    Text('What\'s next?'),
                  ].where((o) => o != null).toList()),
                  onPressed: _requestPushPermissions,
                )
              ]
            )
          ),
          Container(
            color: Colors.pink,
            padding: const EdgeInsets.all(10.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text('That\'s it for now!', style: TextStyle(color: Colors.white, fontSize: 15), textAlign: TextAlign.center),
                SizedBox(height: 10),
                Image(image: AssetImage('assets/completed.png'), width: 300),
                SizedBox(height: 10),
                Text('You\'re ready to get started. If you have any questions or want to get in touch then just send us a quick tweet.', style: TextStyle(color: Colors.white, fontSize: 13), textAlign: TextAlign.center),
                SizedBox(height: 10),
                RaisedButton(
                  child: Text('Let\'s go'),
                  onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil('/home', (Route<dynamic> route) => false),
                ),
                SizedBox(height: 30),
                RaisedButton(
                  child: Text('Follow us on Twitter', style: TextStyle(color: Colors.white)),
                  onPressed: () => launch('https://twitter.com/treadlhq'),
                  color: Colors.blue[600],
                ),
              ]
            )
          ),
        ],
      )
    );
  }
}

class OnboardingScreen extends StatefulWidget {
  @override
  _OnboardingScreenState createState() => _OnboardingScreenState(); 
}
