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

    // Draw threads
    for (var i = 0; i < warp['threading'].length; i++) {
      var thread = warp['threading'][i];
      int? shaft = thread?['shaft'];
      String? colour = warp['defaultColour'];
      double x = size.width - (i+1)*BASE_SIZE;
      if (shaft != null) {
        if (shaft! > 0) {
          canvas.drawRect(
            Offset(x, size.height - shaft!*BASE_SIZE) &
            Size(BASE_SIZE.toDouble(), BASE_SIZE.toDouble()),
            paint
          );
        }
        
      }
      if (thread?['colour'] != null) {
        colour = thread!['colour'];
      }
      if (colour != null) {
        List<String> parts = colour!.split(',');
        canvas.drawRect(
          Offset(x, 0) &
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
