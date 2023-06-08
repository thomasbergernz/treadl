import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'api.dart';
import 'object.dart';

class _ProjectSettingsDialog extends StatelessWidget {
  final Map<String,dynamic> _project;
  final Function _onDelete;
  final Function _onUpdateProject;
  final Api api = Api();
  _ProjectSettingsDialog(this._project, this._onDelete, this._onUpdateProject) {}

  void _toggleVisibility(BuildContext context, bool checked) async {
    var data = await api.request('PUT', '/projects/' + _project['owner']['username'] + '/' + _project['path'], {'visibility': checked ? 'private': 'public'});
    if (data['success']) {
      Navigator.pop(context); 
      _onUpdateProject(data['payload']);
    }
  }

  void _deleteProject(BuildContext context, BuildContext modalContext) async {
    var data = await api.request('DELETE', '/projects/' + _project['owner']['username'] + '/' + _project['path']);
    if (data['success']) {
      Navigator.pop(context);
      Navigator.pop(modalContext);
      _onDelete();
    }
  }

  void _confirmDeleteProject(BuildContext modalContext) {
    showDialog(
      context: modalContext,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: new Text('Really delete this project?'),
        content: new Text('This will remove any files and objects inside the project. This action cannot be undone.'),
        actions: <Widget>[
          CupertinoDialogAction(
            isDefaultAction: true,
            child: Text('No'),
            onPressed: () => Navigator.pop(context),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: Text('Yes'),
            onPressed: () => _deleteProject(context, modalContext),
          ),
        ],
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoActionSheet(
      title: Text('Manage this project'),
      cancelButton: CupertinoActionSheetAction(
        onPressed: () => Navigator.of(context).pop(),
        child: Text('Cancel')
      ),
      actions: [
        Container(
          padding: EdgeInsets.all(5.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
             CupertinoSwitch(
                value: _project['visibility'] == 'private',
                onChanged: (c) => _toggleVisibility(context, c),
              ),
              SizedBox(width: 10),
              Text('Private project', style: Theme.of(context).textTheme.bodyText1),
            ]
          )
        ),
        CupertinoActionSheetAction(
          onPressed: () { _confirmDeleteProject(context); },
          child: Text('Delete project'),
          isDestructiveAction: true,
        ),
      ]
    );
  }
}

class _ProjectScreenState extends State<ProjectScreen> {
  final Function _onDelete;
  final picker = ImagePicker();
  final Api api = Api();
  Map<String,dynamic> _project;
  List<dynamic> _objects = [];
  bool _loading = false;
  bool _creating = false;
  
  _ProjectScreenState(this._project, this._onDelete) { }

  @override
  initState() {
    super.initState();
    getObjects(_project['fullName']);
  }

  void getObjects(String fullName) async {
    setState(() => _loading = true);
    print(fullName);
    var data = await api.request('GET', '/projects/' + fullName + '/objects');
    if (data['success'] == true) {
      setState(() {
        _objects = data['payload']['objects'];
        _loading = false;
      });
    }
  }

  void _onDeleteProject() {
    Navigator.pop(context);
    _onDelete(_project['_id']);
  }
  void _onUpdateProject(project) {
    setState(() {
      _project = project;
    });
  }

  void _onDeleteObject(String id) {
    List<dynamic> _newObjects = _objects.where((p) => p['_id'] != id).toList();
    setState(() {
      _objects = _newObjects;
    });
  }

  void _chooseImage() async {
    File file;
    try {
      final imageFile = await picker.getImage(source: ImageSource.gallery);
      if (imageFile == null) return;
      file = File(imageFile.path);
    }
    on Exception {
      showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
          title: Text('Treadl needs access'),
          content: Text('To add objects to this project you need to give Treadl access to your photos in your phone\'s settings.'),
          actions: <Widget>[
            CupertinoDialogAction(
              isDefaultAction: true,
              child: Text('OK'),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        )
      );
      return;
    }
    final int size = await file.length();
    final String forId = _project['_id'];
    final String fullPath = _project['owner']['username'] + '/' + _project['path'];
    final String name = file.path.split('/').last;
    final String ext = name.split('.').last;
    final String type = 'image/jpeg';//$ext';
    setState(() => _creating = true);

    var data = await api.request('GET', '/uploads/file/request?name=$name&size=$size&type=$type&forType=project&forId=$forId');
    print(data);
    if (!data['success']) {
      setState(() => _creating = false);
      return;
    }
    var uploadSuccess = await api.putFile(data['payload']['signedRequest'], file, type);
    print(uploadSuccess);
    if (!uploadSuccess) {
      setState(() => _creating = false);
      return;
    }
    var newObjectData = {
      'name': name,
      'storedName': data['payload']['fileName'],
      'type': 'file',
    };
    var objectData = await api.request('POST', '/projects/$fullPath/objects', newObjectData);
    setState(() => _creating = false);
    if (objectData['success']) {
      List<dynamic> newObjects = _objects;
      newObjects.add(objectData['payload']);
      setState(() {
        _objects = newObjects;
      });
    }
  }
  
  void showSettingsModal() {
    Widget settingsDialog = new _ProjectSettingsDialog(_project, _onDeleteProject, _onUpdateProject);
    showCupertinoModalPopup(context: context, builder: (BuildContext context) => settingsDialog);
  }

  Widget getMemoryImageBox(data, [bool? isMemory, bool? isNetwork]) {
    return new AspectRatio(
      aspectRatio: 1 / 1,
      child: new Container(
        decoration: new BoxDecoration(
          image: new DecorationImage(
            fit: BoxFit.fitWidth,
            alignment: FractionalOffset.topCenter,
            image: new MemoryImage(data),
          )
        ),
      ),
    );
  }
  Widget getNetworkImageBox(String url) {
    return new AspectRatio(
      aspectRatio: 1 / 1,
      child: new Container(
        decoration: new BoxDecoration(
          image: new DecorationImage(
            fit: BoxFit.fitWidth,
            alignment: FractionalOffset.topCenter,
            image: new NetworkImage(url),
          )
        ),
      ),
    );
  }
  Widget getIconBox(Icon icon) {
    return new AspectRatio(
      aspectRatio: 1 / 1,
      child: icon
    );
  }

  Widget getObjectCard(int index) {
    if (index >= _objects.length) {
      return new Card(
        child: Container(
          padding: EdgeInsets.all(10),
          child: Center(child:CircularProgressIndicator())
        )
      );
    }
    var object = _objects[index];
    Widget leader;
    String type;

    if (object['isImage'] == true) {
      type = 'Image';
      if (object['url'] != null) {
        leader = getNetworkImageBox(object['url']!);
      }
      else {
        leader = getIconBox(Icon(Icons.photo));
      }
    }
    else if (object['type'] == 'pattern' && object['preview'] != null) {
      type = 'Weaving pattern';
      var dat = Uri.parse(object['preview']).data;
      if (dat != null) {
        leader = getMemoryImageBox(dat!.contentAsBytes(), true);
      }
      else {
        leader = getIconBox(Icon(Icons.pattern));
      }
    }
    else if (object['type'] == 'file') {
      type = 'File';
      leader = getIconBox(Icon(Icons.insert_drive_file));
    }
    else {
      type = 'Unknown';
      leader = getIconBox(Icon(Icons.file_present));
    }

    return new Card(
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ObjectScreen(object, _onDeleteObject),
            ),
          );
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            new ListTile(
              leading: leader,
              trailing: Icon(Icons.keyboard_arrow_right),
              title: Text(object['name']),
              subtitle: Text(type),
            ),
          ]
        )
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_project['name']),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              showSettingsModal(); 
            },
          ),
        ]
      ),
      body: _loading ?
        Container(
          margin: const EdgeInsets.all(10.0),
          alignment: Alignment.center,
          child: CircularProgressIndicator()
        )
      : Container(
        margin: const EdgeInsets.all(10.0),
        child: ((_objects != null && _objects.length > 0) || _creating) ?
          ListView.builder(
            itemCount: _objects.length + (_creating ? 1 : 0),
            itemBuilder: (BuildContext context, int index) {
              return getObjectCard(index);
            },
          )
        :
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('This project is currently empty', style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
              Image(image: AssetImage('assets/empty.png'), width: 300),
              Text('Add something to this project using the button below.', textAlign: TextAlign.center),
          ])
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _chooseImage,
        child: Icon(Icons.cloud_upload),
        backgroundColor: Colors.pink[500],
      ),
    ); 
  }
}

class ProjectScreen extends StatefulWidget {
  final Map<String,dynamic> _project;
  final Function _onDelete;
  ProjectScreen(this._project, this._onDelete) { }
  @override
  _ProjectScreenState createState() => _ProjectScreenState(_project, _onDelete); 
}
