import 'package:flutter/material.dart';

class WarpPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final int BASE_SIZE;

  @override
  WarpPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var warp = pattern['warp'];

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

    for (var i = 0; i < warp['threading'].length; i++) {
      int? shaft = warp['threading'][i]?['shaft'];
      if (shaft != null && shaft! > 0) {
        canvas.drawRect(
          Offset(size.width - (i+1)*BASE_SIZE, size.height - shaft!*BASE_SIZE) & Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
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