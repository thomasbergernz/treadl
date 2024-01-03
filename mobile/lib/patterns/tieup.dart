import 'package:flutter/material.dart';

class TieupPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final int BASE_SIZE;

  @override
  TieupPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var warp = pattern['warp'];

    var paint = Paint()
      ..color = Colors.red
      ..strokeWidth = 1;

    // Draw grid
    for (var i = 0; i <= size.width; i += BASE_SIZE) {
      canvas.drawLine(Offset(i.toDouble(), size.height), Offset(i.toDouble(), 0), paint);
    }
  for (var y = 0; y <= size.height; y += BASE_SIZE) {
      canvas.drawLine(Offset(0, y.toDouble()), Offset(size.width, y.toDouble()), paint);
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
