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
  int explorePage = 1;
  final Api api = Api();
  final Util util = Util();

  @override
  initState() {
    super.initState();
    getExploreData();
    getData();
  }

  void getExploreData() async {
    if (explorePage == -1) return;
    var data = await api.request('GET', '/search/explore?page=${explorePage}');
    if (data['success'] == true) {
      setState(() {
        loading = false;
        objects = objects + data['payload']['objects'];
        explorePage = data['payload']['objects'].length == 0 ? -1 : (explorePage + 1); // Set to -1 to disable 'load more'
      });
    }
  }

  void getData() async {
    setState(() {
      loading = true;
    });
    var data2 = await api.request('GET', '/search/discover');
    if (data2['success'] == true) {
      setState(() {
        projects = data2['payload']['highlightProjects'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> patternCards = objects.map<Widget>((object) =>
      PatternCard(object)               
    ).toList();
    if (explorePage > -1) {
      patternCards.add(Center(
        child: CupertinoButton(
          child: Text('Load more'),
          onPressed: () => getExploreData(),
        )
      ));
    }

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
                children: patternCards,
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

