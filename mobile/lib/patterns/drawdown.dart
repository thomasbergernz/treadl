import 'package:flutter/material.dart';
import 'dart:ui' as ui;
import '../util.dart';

class DrawdownPainter extends CustomPainter {
  final Map<String,dynamic> pattern;
  final double BASE_SIZE;

  @override
  DrawdownPainter(this.BASE_SIZE, this.pattern) {}

  @override
  void paint(Canvas canvas, Size size) {
    var weft = pattern['weft'];
    var warp = pattern['warp'];
    var tieups = pattern['tieups'];

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

    for (int tread = 0; tread < weft['treadling']?.length; tread++) {
      for (int thread = 0; thread < warp['threading']?.length; thread++) {
        // Ensure we only get a treadle in the allowed bounds
        int treadle = weft['treadling'][tread]['treadle'] > weft['treadles'] ? 0 : weft['treadling'][tread]['treadle'];
        int shaft = warp['threading'][thread]['shaft'];
        Color weftColour = Util.rgb(weft['treadling'][tread]['colour'] ?? weft['defaultColour']);
        Color warpColour = Util.rgb(warp['threading'][thread]['colour'] ?? warp['defaultColour']);

        // Only capture valid tie-ups (e.g. in case there is data for more shafts, which are then reduced)
        // Dart throws error if index < 0 so check fiest
        List<dynamic> tieup = treadle > 0 ? tieups[treadle - 1] : [];
        List<dynamic> filteredTieup = tieup.where((t) => t< warp['shafts']).toList();
        String threadType = filteredTieup.contains(shaft) ? 'warp' : 'weft';
       
        Rect rect = Offset(
            size.width - BASE_SIZE * (thread + 1),
            tread * BASE_SIZE
          ) & Size(BASE_SIZE, BASE_SIZE);
        canvas.drawRect(
          rect,
          Paint()
            ..color = threadType == 'warp' ? warpColour : weftColour
        );

        canvas.drawRect(
          rect,
          Paint()
            ..shader = ui.Gradient.linear(
              threadType == 'warp' ? rect.centerLeft : rect.topCenter,
              threadType == 'warp' ? rect.centerRight : rect.bottomCenter,
              [
                Color.fromRGBO(0,0,0,0.4),
                Color.fromRGBO(0,0,0,0.0),
                Color.fromRGBO(0,0,0,0.4),
              ],
              [0.0,0.5,1.0],
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
