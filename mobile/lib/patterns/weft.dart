import 'package:flutter/material.dart';

class WeftPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final int BASE_SIZE;

  @override
  WeftPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var weft = pattern['weft'];

    var paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1;

    // Draw grid
    for (var i = 0; i <= size.width; i += BASE_SIZE) {
      canvas.drawLine(Offset(i.toDouble(), size.height), Offset(i.toDouble(), 0), paint);
    }
  for (var y = 0; y <= size.height; y += BASE_SIZE) {
      canvas.drawLine(Offset(0, y.toDouble()), Offset(size.width, y.toDouble()), paint);
    }

    for (var i = 0; i < weft['treadling'].length; i++) {
      int? treadle = weft['treadling'][i]?['treadle'];
      if (treadle != null && treadle! > 0) {
        canvas.drawRect(
          Offset((treadle!.toDouble()-1)*BASE_SIZE, i.toDouble()*BASE_SIZE) & Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
          paint
        );
      }
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
