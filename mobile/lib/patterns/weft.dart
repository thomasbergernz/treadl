import 'package:flutter/material.dart';

class WeftPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final double BASE_SIZE;

  @override
  WeftPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var weft = pattern['weft'];

    var paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1;

    // Draw grid
    for (double i = 0; i <= size.width; i += BASE_SIZE) {
      canvas.drawLine(Offset(i.toDouble(), size.height), Offset(i.toDouble(), 0), paint);
    }
  for (double y = 0; y <= size.height; y += BASE_SIZE) {
      canvas.drawLine(Offset(0, y.toDouble()), Offset(size.width, y.toDouble()), paint);
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
        List<String> parts = colour!.split(',');
        canvas.drawRect(
          Offset(size.width - BASE_SIZE, y) &
          Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
          Paint()
            ..color = Color.fromRGBO(
              int.parse(parts[0]),
              int.parse(parts[1]),
              int.parse(parts[2]),
              1
            )
        );
      }
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
