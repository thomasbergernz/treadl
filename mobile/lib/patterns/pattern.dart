import 'package:flutter/material.dart';
import 'warp.dart';
import 'weft.dart';
import 'tieup.dart';

class Pattern extends StatelessWidget {
  final Map<String,dynamic> pattern;
  final int BASE_SIZE = 10;

  @override
  Pattern(this.pattern) {}

  double getSize(num input) {
    return input.toDouble();
  }

  @override
  Widget build(BuildContext context) {
    var warp = pattern['warp'];
    var weft = pattern['weft'];

    return
        SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Container(
      width: getSize(
        warp['threading']?.length * BASE_SIZE +
        weft['treadles'] * BASE_SIZE + 20
      ),
      height: getSize(
        warp['shafts'] * BASE_SIZE +
        weft['treadling']?.length * BASE_SIZE + 20
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: CustomPaint(
              size: Size(
                getSize(weft['treadles'] * BASE_SIZE),
                getSize(warp['shafts'] * BASE_SIZE),
              ),
              painter: TieupPainter(BASE_SIZE, this.pattern),
            ),
          ),
          Positioned(
            right: getSize(weft['treadles'] * BASE_SIZE + 20),
            top: 0,
            child: CustomPaint(
              size: Size(
                getSize(warp['threading']?.length * BASE_SIZE),
                getSize(warp['shafts'] * BASE_SIZE + BASE_SIZE)
              ),
              painter: WarpPainter(BASE_SIZE, this.pattern),
            ),
          ),
          Positioned(
            right: 0,
            top: getSize(warp['shafts'] * BASE_SIZE + 20),
            child: CustomPaint(
              size: Size(
                getSize(weft['treadles'] * BASE_SIZE),
                getSize(weft['treadling'].length * BASE_SIZE)
              ),
              painter: WeftPainter(BASE_SIZE, this.pattern),
            ),
          )
        ],
      ),
    ));
  }
}
