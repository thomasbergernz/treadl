import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';

class Api {

  String _token;
  final String apiBase = 'https://api.treadl.com';
  //final String apiBase = 'http://localhost:8000';

  Future<String> loadToken() async {
    if (_token != null) {
      return _token;
    }
    SharedPreferences prefs = await SharedPreferences.getInstance();      
    final String token = prefs.getString('apiToken');
    return token;
  }
  Future<Map<String,String>> getHeaders(method) async {
    Map<String,String> headers = {};
    String token = await loadToken();
    if (token != null) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    if (method == 'POST') {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  Future<http.Response> _get(String url) async {
    http.Client client = http.Client();
    return await client.get(url, headers: await getHeaders('GET'));
  }
  Future<http.Response> _post(String url, Map<String, dynamic> data) async {
    String json = jsonEncode(data);
    http.Client client = http.Client();
    return await client.post(url, headers: await getHeaders('POST'), body: json);
  }
  Future<http.Response> _put(String url, Map<String, dynamic> data) async {
    String json = jsonEncode(data);
    http.Client client = http.Client();
    return await client.put(url, headers: await getHeaders('POST'), body: json);
  }
  Future<http.Response> _delete(String url) async {
    http.Client client = http.Client();
    return await client.delete(url, headers: await getHeaders('DELETE'));
  }

  Future<Map<String, dynamic>> request(String method, String path, [Map<String, dynamic> data]) async {
    String url = apiBase + path;
    http.Response response;
    if (method == 'POST') {
      response = await _post(url, data);
    }
    if (method == 'PUT') {
      response = await _put(url, data);
    }
    if (method == 'GET') {
      response = await _get(url);
    }
    if (method == 'DELETE') {
      response = await _delete(url);
    }
    int status = response.statusCode;
    if (status == 200) {
      print('SUCCESS');
      Map<String, dynamic> respData = jsonDecode(response.body);
      return {'success': true, 'payload': respData};
    }
    else {
      print('ERROR');
      Map<String, dynamic> respData = jsonDecode(response.body);
      return {'success': false, 'code': response.statusCode, 'message': respData['Message']};
    }
  }

 Future<bool> putFile(String url, File file, String contentType) async { 
    http.Client client = http.Client();
    Map<String,String> headers = {
      'Content-Type': contentType
    };
    http.Response response = await client.put(url, headers: headers, body: await file.readAsBytes());
    int status = response.statusCode;
    return status == 200;
  }
}
