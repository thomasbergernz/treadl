import 'package:flutter/material.dart';
import '../util.dart';

class WeftPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final double BASE_SIZE;
  final Util util = Util();

  @override
  WeftPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var weft = pattern['weft'];

    var paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 0.5;
    var thickPaint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1.5;

    // Draw grid
    int rowsPainted = 0;
    for (double i = 0; i <= size.width; i += BASE_SIZE) {
      canvas.drawLine(Offset(i.toDouble(), size.height), Offset(i.toDouble(), 0), paint);
    }
  for (double y = 0; y <= size.height; y += BASE_SIZE) {
      canvas.drawLine(Offset(0, y.toDouble()), Offset(size.width, y.toDouble()), paint);
      rowsPainted += 1;
    }

    for (var i = 0; i < weft['treadling'].length; i++) {
      var thread = weft['treadling'][i];
      int? treadle = thread?['treadle'];
      String? colour = weft['defaultColour'];
      double y = i.toDouble()*BASE_SIZE;
      if (treadle != null && treadle! > 0) {
        canvas.drawRect(
          Offset((treadle!.toDouble()-1)*BASE_SIZE, y) &
          Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
          paint
        );
      }
      if (thread?['colour'] != null) {
        colour = thread!['colour'];
      }
      if (colour != null) {
        canvas.drawRect(
          Offset(size.width - BASE_SIZE, y) &
          Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
          Paint()
            ..color = util.rgb(colour!)
        );
      }
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
