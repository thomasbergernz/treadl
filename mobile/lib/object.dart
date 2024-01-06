import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_html/flutter_html.dart';
import 'api.dart';
import 'patterns/pattern.dart';
import 'patterns/viewer.dart';

class _ObjectScreenState extends State<ObjectScreen> {
  final Map<String,dynamic> _project;
  Map<String,dynamic> _object;
  Map<String,dynamic>? _pattern;
  final Function _onUpdate;
  final Function _onDelete;
  final Api api = Api();
  
  _ObjectScreenState(this._object, this._project, this._onUpdate, this._onDelete) { }

  @override
  initState() {
    super.initState();
    if (_object['type'] == 'pattern') {
      _fetchPattern();
    }
  }

  void _fetchPattern() async {
    var data = await api.request('GET', '/objects/' + _object['_id']);
    if (data['success'] == true) {
      setState(() {
        _pattern = data['payload']['pattern']; 
      });
    }
  }

  void _deleteObject(BuildContext context, BuildContext modalContext) async {
    var data = await api.request('DELETE', '/objects/' + _object['_id']);
    if (data['success']) {
      Navigator.pop(context);
      Navigator.pop(modalContext);
      Navigator.pop(context);
      _onDelete(_object['_id']);
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
            onPressed: () => Navigator.pop(context),
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
                Navigator.pop(context);
              },
            ),
            TextButton(
              child: Text('OK'),
              onPressed: () async {
                var data = await api.request('PUT', '/objects/' + _object['_id'], {'name': renameController.text});
                if (data['success']) {
                  Navigator.pop(context);
                  _object['name'] = data['payload']['name'];
                  _onUpdate(_object['_id'], data['payload']);
                  setState(() {
                    _object = _object;
                  });
                }
                Navigator.pop(context);
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
            onPressed: () => Navigator.of(modalContext).pop(),
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
    if (_object['isImage'] == true) {
      return Image.network(_object['url']);
    }
    else if (_object['type'] == 'pattern') {
      if (_pattern != null) {
        return PatternViewer(_pattern!, withEditor: true);
      }
      else if (_object['previewUrl'] != null) {
        return Image.network(_object['previewUrl']!);;
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
            launch(_object['url']);
          }),
        ],
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    String description = '';
    if (_object['description'] != null)
      description = _object['description'];
    return Scaffold(
      appBar: AppBar(
        title: Text(_object['name']),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              _showSettingsModal(context); 
            },
          ),
        ]
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        child: getObjectWidget(),
      ),
    ); 
  }
}

class ObjectScreen extends StatefulWidget {
  final Map<String,dynamic> _object;
  final Map<String,dynamic> _project;
  final Function _onUpdate;
  final Function _onDelete;
  ObjectScreen(this._object, this._project, this._onUpdate, this._onDelete) { }
  @override
  _ObjectScreenState createState() => _ObjectScreenState(_object, _project, _onUpdate, _onDelete); 
}

