import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'routeArguments.dart';
import 'api.dart';
import 'util.dart';
import 'lib.dart';

class _ExploreTabState extends State<ExploreTab> {
  List<dynamic> objects = [];
  List<dynamic> projects = [];
  bool loading = false;
  final Api api = Api();
  final Util util = Util();

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
      setState(() {
        loading = false;
        objects = data['payload']['objects'];
      });
    }
    var data2 = await api.request('GET', '/search/discover');
    if (data2['success'] == true) {
      setState(() {
        projects = data2['payload']['highlightProjects'];
      });
    }
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
          color: Color.fromRGBO(255, 251, 248, 1),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 10),
              CustomText('Discover projects', 'h1', margin: 5),
              Container(
                height: 130,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: projects.map((p) => ProjectCard(p)).toList()
                )
              ),
              SizedBox(height: 10),
              CustomText('Recent patterns', 'h1', margin: 5),
              Expanded(child: GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 5,
                crossAxisSpacing: 5,
                childAspectRatio: 0.9,
                children: objects.map((object) =>
                  PatternCard(object)               
                ).toList(),
              )),
            ]
          )
        ),
    ); 
  }
}

class ExploreTab extends StatefulWidget {
  @override
  _ExploreTabState createState() => _ExploreTabState(); 
}

