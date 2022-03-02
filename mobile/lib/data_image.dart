import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';

class DataImage extends StatefulWidget {
  final String _data;
  DataImage(this._data) {}

  @override
  DataImageState createState() => new DataImageState(_data);
}

class DataImageState extends State<MyHomePage> {
  String _base64;
  DataImageState(this._base64) {}

  @override
  Widget build(BuildContext context) {
    if (_base64 == null)
      return new Container();
    Uint8List bytes = BASE64.decode(_base64);
    return new Scaffold(
      appBar: new AppBar(title: new Text('Example App')),
      body: new ListTile(
        leading: new Image.memory(bytes),
        title: new Text(_base64),
      ),
    );
  }
}
