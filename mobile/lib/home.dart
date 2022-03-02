import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'projects.dart';
import 'groups.dart';

class _NavigationHomePageState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  TabController _controller;
  _NavigationHomePageState() {
    _controller=TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: Material (
        child: TabBar(
          tabs: <Tab> [
            Tab(text: 'Projects', icon: Icon(Icons.folder)),
            Tab(text: 'Groups', icon: Icon(Icons.person)),
          ],
          controller: _controller,
        ),
        color: Colors.black,
      ),
      body: TabBarView(
        children: <Widget> [
          ProjectsTab(),
          GroupsTab()
        ],
        controller: _controller,
      )
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _NavigationHomePageState createState() => _NavigationHomePageState();
}
