import 'package:flutter/foundation.dart';

class Store extends ChangeNotifier {
  String apiToken;

  void setToken(String newToken) {
    apiToken = newToken;
  }
}
