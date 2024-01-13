import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api.dart';

class User {
  final String id;
  final String username;
  String? avatar;
  String? avatarUrl;

  User(this.id, this.username, {this.avatar, this.avatarUrl}) {}

  static User loadJSON(Map<String,dynamic> input) {
    return User(input['_id'], input['username'], avatar: input['avatar'], avatarUrl: input['avatarUrl']);
  }
}

class AppModel extends ChangeNotifier {
  User? user;
  void setUser(User? u) {
    user = u;
    notifyListeners();
  }

  String? apiToken;
  void setToken(String? newToken) async {
    apiToken = newToken;
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    if (apiToken != null) {
      Api api = Api(token: apiToken!);       
      prefs.setString('apiToken', apiToken!);
      var data = await api.request('GET', '/users/me');
      if (data['success'] == true) {
        setUser(User.loadJSON(data['payload']));
        print(data);
      }
    } else {
      prefs.remove('apiToken');
    }
  }
/*
  /// Internal, private state of the cart.
  final List<Item> _items = [];

  /// An unmodifiable view of the items in the cart.
  UnmodifiableListView<Item> get items => UnmodifiableListView(_items);

  /// The current total price of all items (assuming all items cost $42).
  int get totalPrice => _items.length * 42;

  /// Adds [item] to cart. This and [removeAll] are the only ways to modify the
  /// cart from the outside.
  void add(Item item) {
    _items.add(item);
    // This call tells the widgets that are listening to this model to rebuild.
    notifyListeners();
  }

  /// Removes all items from the cart.
  void removeAll() {
    _items.clear();
    // This call tells the widgets that are listening to this model to rebuild.
    notifyListeners();
  }*/
}
