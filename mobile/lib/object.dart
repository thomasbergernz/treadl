import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_html/flutter_html.dart';
import 'api.dart';

class _ObjectScreenState extends State<ObjectScreen> {
  final Map<String,dynamic> _object;
  final Function _onDelete;
  final Api api = Api();
  
  _ObjectScreenState(this._object, this._onDelete) { }

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
        title: new Text('Really delete this object?'),
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
              onPressed: () => _confirmDeleteObject(modalContext),
              child: Text('Delete object'),
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
      var dat = Uri.parse(_object['preview']).data;
      if (dat != null) {
        return Image.memory(dat!.contentAsBytes());
      }
      else {
        return Icon(Icons.pattern);
      }
    }
    else {
      return ElevatedButton(child: Text('View file'), onPressed: () {
        launch(_object['url']);
      });
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
        child: ListView(
          children: <Widget>[
            getObjectWidget(),
            Html(data: description)
          ] 
        )
      ),
    ); 
  }
}

class ObjectScreen extends StatefulWidget {
  final Map<String,dynamic> _object;
  final Function _onDelete;
  ObjectScreen(this._object, this._onDelete) { }
  @override
  _ObjectScreenState createState() => _ObjectScreenState(_object, _onDelete); 
}
