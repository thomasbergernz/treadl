import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_expandable_fab/flutter_expandable_fab.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import 'api.dart';
import 'util.dart';
import 'object.dart';

class _ProjectScreenState extends State<ProjectScreen> {
  final Function? onUpdate;
  final Function? onDelete;
  final picker = ImagePicker();
  final Api api = Api();
  final Util util = Util();
  Map<String,dynamic> _project;
  List<dynamic> _objects = [];
  bool _loading = false;
  bool _creating = false;
  
  _ProjectScreenState(this._project, {this.onUpdate, this.onDelete}) { }

  @override
  initState() {
    super.initState();
    getObjects(_project['fullName']);
  }

  void getObjects(String fullName) async {
    setState(() => _loading = true);
    var data = await api.request('GET', '/projects/' + fullName + '/objects');
    if (data['success'] == true) {
      setState(() {
        _objects = data['payload']['objects'];
        _loading = false;
      });
    }
  }

  void _shareProject() {
    util.shareUrl('Check out my project on Treadl', util.appUrl(_project['fullName']));
  }

  void _onDeleteProject() {
    Navigator.pop(context);
    onDelete!(_project['_id']);
  }
  void _onUpdateProject(project) {
    setState(() {
      _project = project;
    });
    onUpdate!(project['_id'], project);
  }

  void _onUpdateObject(String id, Map<String,dynamic> update) {
    List<dynamic> _newObjects = _objects.map((o) {
      if (o['_id'] == id) {
        o.addAll(update);
      }
      return o;
    }).toList();
    setState(() {
      _objects = _newObjects;
    });
  }
  void _onDeleteObject(String id) {
    List<dynamic> _newObjects = _objects.where((p) => p['_id'] != id).toList();
    setState(() {
      _objects = _newObjects;
    });
  }

  void _createObject(objectData) async {
    String fullPath = _project['fullName'];
    var resp = await api.request('POST', '/projects/$fullPath/objects', objectData);
    setState(() => _creating = false);
    if (resp['success']) {
      List<dynamic> newObjects = _objects;
      newObjects.add(resp['payload']);
      setState(() {
        _objects = newObjects;
      });
    }
  }

  void _createObjectFromWif(String name, String wif) {
    setState(() => _creating = true);
    _createObject({
      'name': name,
      'type': 'pattern',
      'wif': wif,
    });
  }

  void _createObjectFromFile(String name, XFile file) async {
    final int size = await file.length();
    final String forId = _project['_id'];
    final String type = file.mimeType ?? 'text/plain';
    setState(() => _creating = true);
    var data = await api.request('GET', '/uploads/file/request?name=$name&size=$size&type=$type&forType=project&forId=$forId');
    if (!data['success']) {
      setState(() => _creating = false);
      return;
    }
    var uploadSuccess = await api.putFile(data['payload']['signedRequest'], File(file.path), type);
    if (!uploadSuccess) {
      setState(() => _creating = false);
      return;
    }
    _createObject({
      'name': name,
      'storedName': data['payload']['fileName'],
      'type': 'file',
    });
  }

  void _chooseFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      PlatformFile file = result.files.single;
      XFile xFile = XFile(file.path!);
      String? ext = file.extension;
      if (ext != null && ext!.toLowerCase() == 'wif' || xFile.name.toLowerCase().contains('.wif')) {
        final String contents = await xFile.readAsString();
        _createObjectFromWif(file.name, contents);
      } else {
        _createObjectFromFile(file.name, xFile);
      }
    }
  }

  void _chooseImage() async {
    File file;
    try {
      final XFile? imageFile = await picker.pickImage(source: ImageSource.gallery);
      if (imageFile == null) return;
      final f = new DateFormat('yyyy-MM-dd_hh-mm-ss');
      String time = f.format(new DateTime.now());
      String name = _project['name'] + ' ' + time + '.' + imageFile.name.split('.').last;
      _createObjectFromFile(name, imageFile);
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
    }
  }
  
  void showSettingsModal() {
    Widget settingsDialog = new _ProjectSettingsDialog(_project, _onDeleteProject, _onUpdateProject);
    showCupertinoModalPopup(context: context, builder: (BuildContext context) => settingsDialog);
  }

  Widget getNetworkImageBox(String url) {
    return new AspectRatio(
      aspectRatio: 1 / 1,
      child: new Container(
        decoration: new BoxDecoration(
          borderRadius: BorderRadius.circular(10.0),
          image: new DecorationImage(
            fit: BoxFit.cover,
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
      child: new Container(
        decoration: new BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(10.0),
        ),
        child: icon
      ),
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
    else if (object['type'] == 'pattern') {
      type = 'Weaving pattern';
      if (object['previewUrl'] != null) {
        leader = getNetworkImageBox(object['previewUrl']!);
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
              builder: (context) => ObjectScreen(object, _project, onUpdate: _onUpdateObject, onDelete: _onDeleteObject),
            ),
          );
        },
        child: ListTile(
          leading: leader,
          trailing: Icon(Icons.keyboard_arrow_right),
          title: Text(object['name']),
          subtitle: Text(type),
        ),
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
            icon: Icon(Icons.ios_share),
            onPressed: () {
              _shareProject(); 
            },
          ),
          onUpdate != null ? IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              showSettingsModal(); 
            },
          ) : SizedBox(width: 0),
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
              Text('Add a pattern file, an image, or something else to this project using the + button below.', textAlign: TextAlign.center),
          ])
      ),
      floatingActionButtonLocation: ExpandableFab.location,
      floatingActionButton: ExpandableFab(
        distance: 70,
        type: ExpandableFabType.up,
        openButtonBuilder: RotateFloatingActionButtonBuilder(
          child: const Icon(Icons.add),
        ),
        children: [
          Row(children:[
            Container(
              padding: EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: Colors.grey[800],
                borderRadius: BorderRadius.all(Radius.circular(12)),
              ),
              child: Text('Add an image', style: TextStyle(fontSize: 15, color: Colors.white)),
            ),
            SizedBox(width: 10),
            FloatingActionButton(
              heroTag: null,
              onPressed: _chooseImage,
              child: Icon(Icons.image_outlined),
            ),
          ]),
          Row(children:[
            Container(
              padding: EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: Colors.grey[800],
                borderRadius: BorderRadius.all(Radius.circular(12)),
              ),
              child: Text('Add a WIF or other file', style: TextStyle(fontSize: 15, color: Colors.white)),
            ),
            SizedBox(width: 10),
            FloatingActionButton(
              heroTag: null,
              child: const Icon(Icons.insert_drive_file_outlined),
              onPressed: _chooseFile,
            ),
          ]),
        ],
      ),
    ); 
  }
}

class ProjectScreen extends StatefulWidget {
  final Map<String,dynamic> _project;
  final Function? onUpdate;
  final Function? onDelete;
  ProjectScreen(this._project, {this.onUpdate, this.onDelete}) { }
  @override
  _ProjectScreenState createState() => _ProjectScreenState(_project, onUpdate: onUpdate, onDelete: onDelete); 
}

class _ProjectSettingsDialog extends StatelessWidget {
  final Map<String,dynamic> _project;
  final Function _onDelete;
  final Function _onUpdateProject;
  final Api api = Api();
  _ProjectSettingsDialog(this._project, this._onDelete, this._onUpdateProject) {}
  
  void _renameProject(BuildContext context) async {
    TextEditingController renameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Rename your project'),
          content: TextField(
            autofocus: true,
            controller: renameController,
            decoration: InputDecoration(hintText: "Enter a new name for the project"),
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
                var data = await api.request('PUT', '/projects/' + _project['owner']['username'] + '/' + _project['path'], {'name': renameController.text});
                if (data['success']) {
                  Navigator.pop(context); 
                  _onUpdateProject(data['payload']);
                }
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

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
          onPressed: () { _renameProject(context); },
          child: Text('Rename project'),
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
