import 'package:flutter/material.dart';
import 'warp.dart';
import 'weft.dart';
import 'tieup.dart';
import 'drawdown.dart';

class Pattern extends StatelessWidget {
  final Map<String,dynamic> pattern;
  final double BASE_SIZE = 10;

  @override
  Pattern(this.pattern) {}

  double getSize(num input) {
    return input.toDouble();
  }

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

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Container(
      width: draftWidth,
      height: draftHeight,
      child: Stack(
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
        ],
      ),
    ));
  }
}
