import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'routeArguments.dart';
import 'api.dart';
import 'project.dart';
import 'settings.dart';

class _ExploreTabState extends State<ExploreTab> {
  List<dynamic> objects = [];
  bool loading = false;
  final Api api = Api();

  @override
  initState() {
    super.initState();
    getData();
  }

  void getData() async {
    setState(() {
      loading = true;
    });
    var data = await api.request('GET', '/search/explore');
    if (data['success'] == true) {
      print(data);
      setState(() {
        loading = false;
        objects = data['payload']['objects'];
      });
    }
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
@override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Explore'),
      ),
      body: loading ?
        Container(
          margin: const EdgeInsets.all(10.0),
          alignment: Alignment.center,
          child: CircularProgressIndicator()
        )
      : Container(
          margin: const EdgeInsets.all(10.0),
          alignment: Alignment.center,
          child: GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 5,
            crossAxisSpacing: 5,
            children: objects.map((object) =>
              Card(
                elevation: 3,
                clipBehavior: Clip.hardEdge,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6.0),
                ),
                child: InkWell(
                  onTap: () {
            
                  },
                  child: Column(
                    children: [
                        Container(
                          height: 100,
                          decoration: BoxDecoration(
                            image: DecorationImage(
                              fit: BoxFit.cover,
                              image: NetworkImage(object['previewUrl']),
                            ),
                          ),
                        ),
                      Text(object['name']),
                    ]
                  )
                )
              )
            ).toList(),
          ),
        ),
    ); 
  }
}

class ExploreTab extends StatefulWidget {
  @override
  _ExploreTabState createState() => _ExploreTabState(); 
}

