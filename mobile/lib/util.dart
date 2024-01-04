import 'package:flutter/material.dart';

class Util {

  ImageProvider avatarUrl(Map<String,dynamic> user) {
    ImageProvider a = AssetImage('assets/avatars/9.png');
    if (user != null && user['avatar'] != null) {
      if (user['avatar'].length < 3) {
        a = AssetImage('assets/avatars/${user['avatar']}.png');
      }
      else {
        a =NetworkImage(user['avatarUrl']);
      }
    }
    return a;
  }

  Widget avatarImage(ImageProvider image, {double size=30}) {
    return new Container(
      width: size,
      height: size,
      decoration: new BoxDecoration(
        shape: BoxShape.circle,
        image: new DecorationImage(
          fit: BoxFit.fill,
          image: image
        )
      )
    );
  }

  Color rgb(String input) {
    List<String> parts = input.split(',');
    List<int> iParts = parts.map((p) => int.parse(p)).toList();
    iParts = iParts.map((p) => p > 255 ? 255 : p).toList();
    return Color.fromRGBO(iParts[0], iParts[1], iParts[2], 1);
  }
}
