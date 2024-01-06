import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import 'api.dart';

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

  Future<String> storagePath() async {
    final Directory directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File?> storeFile(String fileName, String data) async {
    final String dirPath = await storagePath();
    final file = File('$dirPath/$fileName');
    return await file.writeAsString(data);
  }

  void shareFile(File file) async {
    await Share.shareXFiles([XFile(file.path)]);
  }

  void shareUrl(String text, String url) async {
    await Share.share('$text: $url');
  }
}
