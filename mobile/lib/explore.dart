import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'routeArguments.dart';
import 'api.dart';
import 'util.dart';
import 'lib.dart';
import 'object.dart';

class _ExploreTabState extends State<ExploreTab> {
  List<dynamic> objects = [];
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
      print(data);
      setState(() {
        loading = false;
        objects = data['payload']['objects'];
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
          margin: const EdgeInsets.only(left: 10, right: 10),
          alignment: Alignment.center,
          child: GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 5,
            crossAxisSpacing: 5,
            childAspectRatio: 0.9,
            children: objects.map((object) =>
              Card(
                elevation: 20,
                clipBehavior: Clip.hardEdge,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6.0),
                ),
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ObjectScreen(object, object['projectObject']),
                      ),
                    );
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
                      Container(
                        padding: EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            UserChip(object['userObject']),
                            SizedBox(height: 5),
                            Text(util.ellipsis(object['name'], 35), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                          ]
                        )
                      )
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

