import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'api.dart';
import 'model.dart';
import 'lib.dart';

class _ProjectsTabState extends State<ProjectsTab> {
  List<dynamic> _projects = [];
  bool _loading = false;
  bool _creatingProject = false;
  final Api api = Api();

  @override
  initState() {
    super.initState();
    getProjects();
  }

  void getProjects() async {
    AppModel model = Provider.of<AppModel>(context, listen: false);
    if (model.user == null) return;
    setState(() {
      _loading = true;
    });
    var data = await api.request('GET', '/users/me/projects');
    if (data['success'] == true) {
      setState(() {
        _projects = data['payload']['projects'];
        _loading = false;
      });
    }
  }

  void _onCreatingProject() {
    setState(() {
      _creatingProject = true;
    });
  }
  void _onCreateProject(newProject) {
    List<dynamic> _newProjects = _projects;
    _newProjects.insert(0, newProject);
    setState(() {
      _projects = _newProjects;
      _creatingProject = false;
    });
  }
  
  void _onUpdateProject(String id, Map<String,dynamic> update) {
    List<dynamic> _newProjects = _projects.map((p) {
      if (p['_id'] == id) {
        p.addAll(update);
      }
      return p;
    }).toList();
    setState(() {
      _projects = _newProjects;
    });
  }

  void _onDeleteProject(String id) {
    List<dynamic> _newProjects = _projects.where((p) => p['_id'] != id).toList();
    setState(() {
      _projects = _newProjects;
    });
  }

  void showNewProjectDialog() async {
    Widget simpleDialog = new _NewProjectDialog(_onCreatingProject, _onCreateProject);
    showDialog(context: context, builder: (BuildContext context) => simpleDialog);
  }

  Widget buildProjectCard(Map<String,dynamic> project) {
    String description = project['description'] != null ? project['description'].replaceAll("\n", " ") : '';
    if (description != null && description.length > 80) {
      description = description.substring(0, 77) + '...';
    }
    if (project['visibility'] == 'public') {
      description = "PUBLIC PROJECT\n" + description;
    }
    else description = "PRIVATE PROJECT\n" + description;
    return new Card(
        child: InkWell(
          onTap: () {
            context.push('/' + project['owner']['username'] + '/' + project['path']);
          },
          child: Container(
            padding: EdgeInsets.all(5),
            child: ListTile(
            leading: new AspectRatio(
              aspectRatio: 1 / 1,
              child: new Container(
                decoration: new BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Icon(Icons.folder)
              ),
            ),
            trailing: Icon(Icons.keyboard_arrow_right),
            title: Text(project['name'] != null ? project['name'] : 'Untitled project'),
            subtitle: Text(description),
          ),
        ))
      )
    ;
  }

  Widget getBody() {
    AppModel model = Provider.of<AppModel>(context);
    if (model.user == null)
      return LoginNeeded(text: 'Once logged in, you\'ll find your own projects shown here.');
    if (_loading) 
      return CircularProgressIndicator();
    else if (_projects != null && _projects.length > 0)
      return ListView.builder(
        itemCount: _projects.length,
        itemBuilder: (BuildContext context, int index) {
          return buildProjectCard(_projects[index]);
        },
      );
    else return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Create your first project', style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
        Image(image: AssetImage('assets/reading.png'), width: 300),
        Text('Projects contain all the files and patterns that make up a piece of work. Create one using the + button below.', textAlign: TextAlign.center),
      ]
    );
  }

  @override
  Widget build(BuildContext context) {
    AppModel model = Provider.of<AppModel>(context);
    User? user = model.user;
    return Scaffold(
      appBar: AppBar(
        title: Text('My Projects'),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.info_outline),
            onPressed: () {
              context.push('/settings');
            },
          ),
        ]
      ),
      body: Container(
        margin: const EdgeInsets.all(10.0),
        alignment: Alignment.center,
        child: getBody()
      ),
      floatingActionButton: user != null ? FloatingActionButton(
        onPressed: showNewProjectDialog,
        child: _creatingProject ? CircularProgressIndicator(backgroundColor: Colors.white) : Icon(Icons.add),
        backgroundColor: Colors.pink[500],
      ) : null,
    ); 
  }
}

class ProjectsTab extends StatefulWidget {
  @override
  _ProjectsTabState createState() => _ProjectsTabState(); 
}

class _NewProjectDialogState extends State<_NewProjectDialog> {
  final TextEditingController _newProjectNameController = TextEditingController();
  final Function _onStart;
  final Function _onComplete;
  String _newProjectName = '';
  bool _newProjectPrivate = false;
  final Api api = Api();

  _NewProjectDialogState(this._onStart, this._onComplete) {}

  void _onToggleProjectVisibility(checked) {
    setState(() {
      _newProjectPrivate = checked;
    });
  }

  void _createProject() async {
    _onStart();
    String name = _newProjectNameController.text;
    bool priv = _newProjectPrivate;
    var data = await api.request('POST', '/projects', {'name': name, 'visibility': priv ? 'private' : 'public'});
    if (data['success'] == true) {
      _onComplete(data['payload']);
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        margin: const EdgeInsets.all(10.0),
        height: 300.0,
        child: Column(
          children: <Widget>[
            Text('Create a new project', style: TextStyle(fontSize: 18)),
            SizedBox(height: 10),
            TextField(
              controller: _newProjectNameController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'My new project', labelText: 'Name your new project'
              )
            ),
            SizedBox(height: 10),
            CheckboxListTile(
              value: _newProjectPrivate,
              onChanged: _onToggleProjectVisibility,
              title: Text('Make this project private')
            ),
            SizedBox(height: 20),
            CupertinoButton(
              color: Colors.pink,
              onPressed: _createProject,
              child: Text('Create'),
            ),
            SizedBox(height: 10),
            CupertinoButton(
              onPressed: () {
                context.pop();
              },
              child: Text('Cancel'),
            )
          ],
        ),
      ),
    );
  }
}
class _NewProjectDialog extends StatefulWidget {
  final Function _onComplete;
  final Function _onStart;
  _NewProjectDialog(this._onStart, this._onComplete) {}
  @override
  _NewProjectDialogState createState() => _NewProjectDialogState(_onStart, _onComplete); 
}
