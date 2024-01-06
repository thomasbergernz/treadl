import 'package:flutter/material.dart';
import 'pattern.dart';

class PatternViewer extends StatefulWidget {
  final Map<String,dynamic> pattern;
  final bool withEditor;
  PatternViewer(this.pattern, {this.withEditor = false}) {}

  @override
  State<PatternViewer> createState() => _PatternViewerState(this.pattern, this.withEditor);
}

class _PatternViewerState extends State<PatternViewer> {
  Map<String,dynamic> pattern; 
  final bool withEditor;
  bool controllerInitialised = false;
  final controller = TransformationController();
  final double BASE_SIZE = 5;

  _PatternViewerState(this.pattern, this.withEditor) {} 

  void updatePattern(update) {
    setState(() {
      pattern!.addAll(update);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!controllerInitialised) {
      var warp = pattern['warp'];
      var weft = pattern['weft'];
      double draftWidth = warp['threading']?.length * BASE_SIZE + weft['treadles'] * BASE_SIZE + BASE_SIZE;
      final zoomFactor = 1.0;
      final xTranslate = draftWidth - MediaQuery.of(context).size.width - 0; 
      final yTranslate = 0.0;
      controller.value.setEntry(0, 0, zoomFactor);
      controller.value.setEntry(1, 1, zoomFactor);
      controller.value.setEntry(2, 2, zoomFactor);
      controller.value.setEntry(0, 3, -xTranslate);
      controller.value.setEntry(1, 3, -yTranslate);
      setState(() => controllerInitialised = true);
    }

    return  InteractiveViewer(
      minScale: 0.5,
      maxScale: 5,
      constrained: false,
      transformationController: controller,
      child: RepaintBoundary(child: Pattern(pattern))
    );


    /*return  Column(
      children: [
        Text('Hi'),
        Expanded(child: InteractiveViewer(
      minScale: 0.5,
      maxScale: 5,
      constrained: false,
      transformationController: controller,
      child: RepaintBoundary(child: Pattern(pattern))))
    ,
        Text('Another'),
      ]
    );*/
  }
}
