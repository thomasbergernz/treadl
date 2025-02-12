import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_expandable_fab/flutter_expandable_fab.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import 'api.dart';
import 'util.dart';
import 'model.dart';
import 'lib.dart';

class _ProjectScreenState extends State<ProjectScreen> {
  final String username;
  final String projectPath;
  final String fullPath;
  final Function? onUpdate;
  final Function? onDelete;
  final picker = ImagePicker();
  final Api api = Api();
  Map<String,dynamic>? project;
  List<dynamic> _objects = [];
  bool _loading = false;
  Map<String,dynamic>? _creatingObject;
  
  _ProjectScreenState(this.username, this.projectPath, {this.project, this.onUpdate, this.onDelete}) :
      fullPath = username + '/' + projectPath;

  @override
  initState() {
    super.initState();
    getProject(fullPath);
    getObjects(fullPath);
  }

  void getProject(String fullName) async {
    setState(() => _loading = true);
    var data = await api.request('GET', '/projects/' + fullName);
    if (data['success'] == true) {
      setState(() {
        project = data['payload'];
        _loading = false;
      });
    }
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
    Util.shareUrl('Check out my project on Treadl', Util.appUrl(fullPath));
  }

  void _onDeleteProject() {
    context.pop();
    onDelete!(project!['_id']);
  }
  void _onUpdateProject(project) {
    setState(() {
      project = project;
    });
    onUpdate!(project!['_id'], project!);
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
    var resp = await api.request('POST', '/projects/$fullPath/objects', objectData);
    setState(() => _creatingObject = null);
    if (resp['success']) {
      List<dynamic> newObjects = _objects;
      newObjects.add(resp['payload']);
      setState(() {
        _objects = newObjects;
      });
    }
  }

  void _createObjectFromWif(String name, String wif) {
    setState(() => _creatingObject = {
      'name': name,
      'type': 'pattern',
    });
    _createObject({
      'name': name,
      'type': 'pattern',
      'wif': wif,
    });
  }

  void _createObjectFromFile(String name, XFile file) async {
    final int size = await file.length();
    final String forId = project!['_id'];
    final String type = file.mimeType ?? 'text/plain';
    setState(() => _creatingObject = {
      'name': name,
      'type': 'file',
    });
    var data = await api.request('GET', '/uploads/file/request?name=$name&size=$size&type=$type&forType=project&forId=$forId');
    if (!data['success']) {
      setState(() => _creatingObject = null);
      return;
    }
    var uploadSuccess = await api.putFile(data['payload']['signedRequest'], File(file.path), type);
    if (!uploadSuccess) {
      setState(() => _creatingObject = null);
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
      String name = project!['name'] + ' ' + time + '.' + imageFile.name.split('.').last;
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
              onPressed: () => context.pop(),
            ),
          ],
        )
      );
    }
  }
  
  void showSettingsModal() {
    Widget settingsDialog = new _ProjectSettingsDialog(project!, _onDeleteProject, _onUpdateProject);
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
    Map<String,dynamic>? objectToShow;
    if (index >= _objects.length) {
      objectToShow = _creatingObject;
      objectToShow!['creating'] = true;
    } else {
      objectToShow = _objects[index];
    }
    Map<String,dynamic> object = objectToShow!;
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
    if (object['creating'] == true) {
      leader = CircularProgressIndicator();
    }

    return new Card(
      child: InkWell(
        onTap: () {
          context.push('/' + username + '/' + projectPath + '/' + object['_id']);
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

  Widget getBody() {
    if (_loading || project == null)
      return CircularProgressIndicator();
    else if ((_objects != null && _objects.length > 0) || _creatingObject != null)
      return ListView.builder(
        itemCount: _objects.length + (_creatingObject != null ? 1 : 0),
        itemBuilder: (BuildContext context, int index) {
          return getObjectCard(index);
        },
      );
    else 
      return EmptyBox('This project is currently empty', description: 'If this is your project, you can add a pattern file, an image, or something else to this project using the + button below.');
  }

  @override
  Widget build(BuildContext context) {
    AppModel model = Provider.of<AppModel>(context);
    User? user = model.user;
    return Scaffold(
      appBar: AppBar(
        title: Text(project?['name'] ?? 'Project'),
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
      body: Container(
        margin: const EdgeInsets.all(10.0),
        alignment: Alignment.center,
        child: getBody(),
      ),
      floatingActionButtonLocation: ExpandableFab.location,
      floatingActionButton: Util.canEditProject(user, project) ? ExpandableFab(
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
      ) : null,
    ); 
  }
}

class ProjectScreen extends StatefulWidget {
  final String username;
  final String projectPath;
  final Map<String,dynamic>? project;
  final Function? onUpdate;
  final Function? onDelete;
  ProjectScreen(this.username, this.projectPath, {this.project, this.onUpdate, this.onDelete}) { }
  @override
  _ProjectScreenState createState() => _ProjectScreenState(username, projectPath, project: project, onUpdate: onUpdate, onDelete: onDelete); 
}

class _ProjectSettingsDialog extends StatelessWidget {
  final String fullPath;
  final Map<String,dynamic> project;
  final Function _onDelete;
  final Function _onUpdateProject;
  final Api api = Api();
  _ProjectSettingsDialog(this.project, this._onDelete, this._onUpdateProject) :
    fullPath = project['owner']['username'] + '/' + project['path'];
  
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
                context.pop();
              },
            ),
            TextButton(
              child: Text('OK'),
              onPressed: () async {
                var data = await api.request('PUT', '/projects/' + fullPath, {'name': renameController.text});
                if (data['success']) {
                  context.pop(); 
                  _onUpdateProject(data['payload']);
                }
                context.pop();
              },
            ),
          ],
        );
      },
    );
  }

  void _toggleVisibility(BuildContext context, bool checked) async {
    var data = await api.request('PUT', '/projects/' + fullPath, {'visibility': checked ? 'private': 'public'});
    if (data['success']) {
      context.pop(); 
      _onUpdateProject(data['payload']);
    }
  }

  void _deleteProject(BuildContext context, BuildContext modalContext) async {
    var data = await api.request('DELETE', '/projects/' + fullPath);
    if (data['success']) {
      context.pop();
      context.pop();
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
            onPressed: () => context.pop(),
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
        onPressed: () => context.pop(),
        child: Text('Cancel')
      ),
      actions: [
        Container(
          padding: EdgeInsets.all(5.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
             CupertinoSwitch(
                value: project?['visibility'] == 'private',
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
