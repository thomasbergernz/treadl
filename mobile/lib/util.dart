import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import 'dart:convert';
import 'api.dart';

String APP_URL = 'https://www.treadl.com';

class Util {

  ImageProvider? avatarUrl(Map<String,dynamic> user) {
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

  Widget avatarImage(ImageProvider? image, {double size=30}) {
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
      child: Icon(Icons.person)
    );
  }

  Color rgb(String input) {
    List<String> parts = input.split(',');
    List<int> iParts = parts.map((p) => int.parse(p)).toList();
    iParts = iParts.map((p) => p > 255 ? 255 : p).toList();
    return Color.fromRGBO(iParts[0], iParts[1], iParts[2], 1);
  }

  String appUrl(String path) {
    return APP_URL + '/' + path;
  }

  Future<String> storagePath() async {
    final Directory directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File> writeFile(String fileName, String data) async {
    final String dirPath = await storagePath();
    final file = File('$dirPath/$fileName');
    String contents = data.replaceAll(RegExp(r'\\n'), '\r\n');
    return await file.writeAsString(contents);
  }

  Future<bool> deleteFile(File file) async {
    await file.delete(); 
    return true;
  }

  void shareFile(File file, {bool? withDelete}) async {
    await Share.shareXFiles([XFile(file.path)]);
    if (withDelete == true) {
      await deleteFile(file);
    }
  }

  void shareUrl(String text, String url) async {
    await Share.share('$text: $url');
  }
}
