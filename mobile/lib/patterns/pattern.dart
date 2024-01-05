import 'package:flutter/material.dart';
import 'warp.dart';
import 'weft.dart';
import 'tieup.dart';
import 'drawdown.dart';

class Pattern extends StatelessWidget {
  final Map<String,dynamic> pattern;
  final controller = TransformationController();
  final double BASE_SIZE = 10;

  @override
  Pattern(this.pattern) {}

  @override
  Widget build(BuildContext context) {
    var warp = pattern['warp'];
    var weft = pattern['weft'];

    double draftWidth = warp['threading']?.length * BASE_SIZE + weft['treadles'] * BASE_SIZE + 20;
    double draftHeight = warp['shafts'] * BASE_SIZE + weft['treadling']?.length * BASE_SIZE + 20;

    double tieupTop = BASE_SIZE;
    double tieupRight = BASE_SIZE;
    double tieupWidth = weft['treadles'] * BASE_SIZE;
    double tieupHeight = warp['shafts'] * BASE_SIZE;

    double warpTop = 0;
    double warpRight = weft['treadles'] * BASE_SIZE + 20;
    double warpWidth = warp['threading']?.length * BASE_SIZE;
    double warpHeight = warp['shafts'] * BASE_SIZE + BASE_SIZE;

    double weftRight = 0;
    double weftTop = warp['shafts'] * BASE_SIZE + 20;
    double weftWidth = weft['treadles'] * BASE_SIZE + BASE_SIZE;
    double weftHeight = weft['treadling'].length * BASE_SIZE;

    double drawdownTop = warpHeight + BASE_SIZE;
    double drawdownRight = weftWidth + BASE_SIZE;
    double drawdownWidth = warpWidth;
    double drawdownHeight = weftHeight;

    final zoomFactor = 1.0;
    final xTranslate = draftWidth - MediaQuery.of(context).size.width - 0; 
    final yTranslate = 0.0;
    controller.value.setEntry(0, 0, zoomFactor);
    controller.value.setEntry(1, 1, zoomFactor);
    controller.value.setEntry(2, 2, zoomFactor);
    controller.value.setEntry(0, 3, -xTranslate);
    controller.value.setEntry(1, 3, -yTranslate);

    return  InteractiveViewer(
      minScale: 0.5,
      maxScale: 5,
      constrained: false,
      transformationController: controller,
      child: Container(
        width: draftWidth,
        height: draftHeight,
        child: RepaintBoundary(child: Stack(
          children: [
            Positioned(
              right: tieupRight,
              top: tieupTop,
              child: CustomPaint(
                size: Size(tieupWidth, tieupHeight),
                painter: TieupPainter(BASE_SIZE, this.pattern),
              ),
            ),
            Positioned(
              right: warpRight,
              top: warpTop,
              child: CustomPaint(
                size: Size(warpWidth, warpHeight),
                painter: WarpPainter(BASE_SIZE, this.pattern),
              ),
            ),
            Positioned(
              right: weftRight,
              top: weftTop,
              child: CustomPaint(
                size: Size(weftWidth, weftHeight),
                painter: WeftPainter(BASE_SIZE, this.pattern),
              ),
            ),
            Positioned(
              right: drawdownRight,
              top: drawdownTop,
              child: CustomPaint(
                size: Size(drawdownWidth, drawdownHeight),
                painter: DrawdownPainter(BASE_SIZE, this.pattern),
              ),
            )
          ]
        ),),
      )
    );
  }
}
