import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import 'dart:convert';
import 'model.dart';

String APP_URL = 'https://www.treadl.com';

class Util {

  static ImageProvider? avatarUrl(Map<String,dynamic> user) {
    if (user != null && user['avatar'] != null) {
      if (user['avatar'].length < 3) {
        return AssetImage('assets/avatars/${user['avatar']}.png');
      }
      else {
        return NetworkImage(user['avatarUrl']);
      }
    }
    return null;
  }

  static Widget avatarImage(ImageProvider? image, {double size=30}) {
    if (image != null) {
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
    return new Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.pink[400],
      ),
      child: Icon(Icons.person, size: size/1.5, color: Colors.white)
    );
  }

  static Color rgb(String input) {
    List<String> parts = input.split(',');
    List<int> iParts = parts.map((p) => int.parse(p)).toList();
    iParts = iParts.map((p) => p > 255 ? 255 : p).toList();
    return Color.fromRGBO(iParts[0], iParts[1], iParts[2], 1);
  }

  static String appUrl(String path) {
    return APP_URL + '/' + path;
  }

  static Future<String> storagePath() async {
    final Directory directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  static Future<File> writeFile(String fileName, String data) async {
    final String dirPath = await Util.storagePath();
    final file = File('$dirPath/$fileName');
    String contents = data.replaceAll(RegExp(r'\\n'), '\r\n');
    return await file.writeAsString(contents);
  }

  static Future<bool> deleteFile(File file) async {
    await file.delete(); 
    return true;
  }

  static void shareFile(File file, {bool? withDelete}) async {
    await Share.shareXFiles([XFile(file.path)]);
    if (withDelete == true) {
      await Util.deleteFile(file);
    }
  }

  static void shareUrl(String text, String url) async {
    await Share.share('$text: $url');
  }

  static String ellipsis(String input, int cutoff) {
    return (input.length <= cutoff)
      ? input
    : '${input.substring(0, cutoff)}...';
  }

  static bool canEditProject(User? user, Map<String,dynamic>? project) {
    if (user == null || project == null) return false;
    return project['user'] == user.id;
  }
}
