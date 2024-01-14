import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:go_router/go_router.dart';
import 'dart:io';
import 'api.dart';
import 'util.dart';
import 'patterns/pattern.dart';
import 'patterns/viewer.dart';

class _ObjectScreenState extends State<ObjectScreen> {
  final String username;
  final String projectPath;
  final String id;
  final Map<String,dynamic>? project;
  Map<String,dynamic>? object;
  Map<String,dynamic>? pattern;
  bool _isLoading = false;
  final Function? onUpdate;
  final Function? onDelete;
  final Api api = Api();
  final Util util = Util();
  
  _ObjectScreenState(this.username, this.projectPath, this.id, {this.object, this.project, this.onUpdate, this.onDelete}) { }

  @override
  initState() {
    super.initState();
    fetchObject();
  }

  void fetchObject() async {
    var data = await api.request('GET', '/objects/' + id);
    if (data['success'] == true) {
      setState(() {
        object = data['payload'];
        pattern = data['payload']['pattern']; 
      });
    }
  }

  void _shareObject() async {
    setState(() => _isLoading = true);
    File? file;
    if (object!['type'] == 'pattern') {
      var data = await api.request('GET', '/objects/' + id + '/wif');
      if (data['success'] == true) {
        file = await util.writeFile(object!['name'] + '.wif', data['payload']['wif']);
      }
    } else {
      String fileName = Uri.file(object!['url']).pathSegments.last;
      file = await api.downloadFile(object!['url'], fileName);
    }

    if (file != null) {
      util.shareFile(file!, withDelete: true);
    }
    setState(() => _isLoading = false);
  }

  void _deleteObject(BuildContext context, BuildContext modalContext) async {
    var data = await api.request('DELETE', '/objects/' + id);
    if (data['success']) {
      context.go('/home');
      onDelete!(id);
    }
  }

  void _confirmDeleteObject(BuildContext modalContext) {
    showDialog(
      context: modalContext,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: new Text('Really delete this item?'),
        content: new Text('This action cannot be undone.'),
        actions: <Widget>[
          CupertinoDialogAction(
            isDefaultAction: true,
            child: Text('No'),
            onPressed: () => context.pop(),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: Text('Yes'),
            onPressed: () => _deleteObject(context, modalContext),
          ),
        ],
      )
    );    
  }
  
  void _renameObject(BuildContext context) {
    TextEditingController renameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Rename this item'),
          content: TextField(
            autofocus: true,
            controller: renameController,
            decoration: InputDecoration(hintText: "Enter a new name for the item"),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('CANCEL'),
              onPressed: () {
                context.pop();
              },
            ),
            TextButton(
              child: Text('OK'),
              onPressed: () async {
                var data = await api.request('PUT', '/objects/' + id, {'name': renameController.text});
                if (data['success']) {
                  context.pop();
                  object!['name'] = data['payload']['name'];
                  onUpdate!(id, data['payload']);
                  setState(() {
                    object = object;
                  });
                }
                context.pop();
              },
            ),
          ],
        );
      },
    );
  }

  void _showSettingsModal(context) {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext modalContext) {
        return CupertinoActionSheet(
          title: Text('Manage this object'),
          cancelButton: CupertinoActionSheetAction(
            onPressed: () => modalContext.pop(),
            child: Text('Cancel')
          ),
          actions: [
            CupertinoActionSheetAction(
              onPressed: () => _renameObject(context),
              child: Text('Rename item'),
            ),
            CupertinoActionSheetAction(
              onPressed: () => _confirmDeleteObject(modalContext),
              child: Text('Delete item'),
              isDestructiveAction: true,
            ),
          ]
        );
      }
    );
  }

  Widget getObjectWidget() {
    if (object == null) {
      return Center(child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [CircularProgressIndicator()]
      ));
    }
    else if (object!['isImage'] == true && object!['url'] != null) {
      print(object!['url']);
      return Image.network(object!['url']);
    }
    else if (object!['type'] == 'pattern') {
      if (pattern != null) {
        return PatternViewer(pattern!, withEditor: true);
      }
      else if (object!['previewUrl'] != null) {
        return Image.network(object!['previewUrl']!);;
      }
      else {
        return Column(
          children: [
            SizedBox(height: 50),
            Icon(Icons.pattern, size: 40),
            SizedBox(height: 20),
            Text('A preview of this pattern is not yet available'),
          ],
        );
      }
    }
    else {
      return Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Treadl cannot display this type of item.'),
          SizedBox(height: 20),
          ElevatedButton(child: Text('View file'), onPressed: () {
            launch(object!['url']);
          }),
        ],
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    String description = '';
    if (object?['description'] != null)
      description = object!['description']!;
    return Scaffold(
      appBar: AppBar(
        title: Text(object?['name'] ?? 'Object'),
        actions: <Widget>[
           IconButton(
            icon: Icon(Icons.ios_share),
            onPressed: () {
              _shareObject(); 
            },
          ),
          onUpdate != null ? IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              _showSettingsModal(context); 
            },
          ) : SizedBox(height: 0),
        ]
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        child: Column(
          children: [
            _isLoading ? LinearProgressIndicator() : SizedBox(height: 0),
            Expanded(child: getObjectWidget()),
          ]
        )
      ),
    ); 
  }
}

class ObjectScreen extends StatefulWidget {
  final String username;
  final String projectPath;
  final String id;
  final Map<String,dynamic>? object;
  final Map<String,dynamic>? project;
  final Function? onUpdate;
  final Function? onDelete;
  ObjectScreen(this.username, this.projectPath, this.id, {this.object, this.project, this.onUpdate, this.onDelete}) { }
  @override
  _ObjectScreenState createState() => _ObjectScreenState(username, projectPath, id, object: object, project: project, onUpdate: onUpdate, onDelete: onDelete); 
}

