import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import utils from '../../../../utils/utils.js';
import actions from '../../../../actions/index.js';

const WarpContainer = styled.div`
  top:0px;
  position: absolute;
  right: ${props => (props.treadles * props.baseSize) + 20}px;
  height: ${props => (props.shafts * props.baseSize) + 40}px;
  width: 100%;
  cursor: ${props => props.tool === 'insert' ? 'w-resize': 'initial'};
  .warp-colourway td{
    border:none;
    border-top:1px solid rgb(150,150,150);
  }
`;

const WarpCanvas = styled.canvas`
  position: absolute;
  top: 10px;
  right: 0px;
  height: ${props => props.warp.shafts * props.baseSize}px;
  width: ${props => props.warp.threading.length * props.baseSize}px;
  border-radius: 4;
  box-shadow: 0px 0px 10px rgba(0,0,0,0.15);
`;

const Colourway = styled.canvas`
  position: absolute;
  top: 0px;
  right: 0px;
  height: 10px;
  width: ${props => props.warp.threading.length * props.baseSize}px;
`;

const squares = {};
const markers = {};
const selectedMarkers = {};
let dragging = false;
let highlightMode = false; // true for highlighting, false for removing highlight
let startShaft = null;
let startThread = null;
let warpTouchListeners = {};

function Warp({ baseSize, cellStyle, warp, weft, updatePattern }) {
  const [draggingColourway, setDraggingColourway] = useState(false);
  const [hoveredThread, setHoveredThread] = useState(null);
  const { editor } = useSelector(state => ({ editor: state.objects.editor }));
  const { tool, colour } = editor;
  const warpRef = useRef(null);
  const colourwayRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => paintDrawdown());
  useEffect(() => {
    const canvas = warpRef.current;
    if (!canvas) return;
    document.body.addEventListener("touchstart", e => {
      if (e.target == canvas) e.preventDefault();
    }, false);
    document.body.addEventListener("touchend", e => {
      if (e.target == canvas) e.preventDefault();
    }, false);
    document.body.addEventListener("touchmove", e => {
      if (e.target == canvas) e.preventDefault();
    }, false);

    const onTouchStart = e =>
      mouseDown(new MouseEvent("mousedown", {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      }));
    const onTouchEnd = e => {
      canvas.dispatchEvent(new MouseEvent("mouseup", {}));
    };
    const onTouchMove = e => {
      e.preventDefault();
      mouseMove(new MouseEvent("mousemove", {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      }));
    };

    canvas.removeEventListener('touchstart', warpTouchListeners.touchStart);
    canvas.addEventListener("touchstart", onTouchStart, false);
    warpTouchListeners.touchStart = onTouchStart;

    canvas.removeEventListener('touchend', warpTouchListeners.touchEnd);
    canvas.addEventListener("touchend", onTouchEnd, false);
    warpTouchListeners.touchEnd = onTouchEnd;

    canvas.removeEventListener('touchmove', warpTouchListeners.touchMove);
    canvas.addEventListener("touchmove", onTouchMove, false);
    warpTouchListeners.touchMove = onTouchMove;
  }, [warpRef, tool, colour]);

  const getThreadShaft = (event, element) => {
    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = 0 - (event.clientX - rect.right);
    const shaft = warp.shafts - parseInt(y / baseSize);
    const thread = parseInt(x / baseSize);
    return { shaft, thread };
  };

  const mouseClickColourway = event => {
    const newWarp = Object.assign({}, warp);
    const { thread } = getThreadShaft(event, colourwayRef.current);
    if (thread >= warp.threading.length) fillUpTo(newWarp, thread);
    newWarp.threading[thread].colour = editor.colour;
    updatePattern({ warp: newWarp });
  };
  const mouseDownColourway = event => {
    event.preventDefault();
    setDraggingColourway(true);
  };
  const mouseUpColourway = event => setDraggingColourway(false);
  const mouseMoveColourway = (event) => {
    if (draggingColourway) {
      const newWarp = Object.assign({}, warp);
      const { thread } = getThreadShaft(event, colourwayRef.current);
      if (thread >= warp.threading.length) fillUpTo(newWarp, thread);
      newWarp.threading[thread].colour = editor.colour;
      updatePattern({ warp: newWarp });
    }
  };

  const mouseUp = event => {
    dragging = false;
    setHoveredThread(null);
  };
  const mouseDown = (event) => {
    event.preventDefault();
    const { shaft, thread } = getThreadShaft(event, warpRef.current);
    startShaft = shaft;
    startThread = thread;
    dragging = true;
    highlightMode = !warp?.threading[thread]?.isSelected;
  };
  const mouseMove = (event) => {
    const { shaft, thread } = getThreadShaft(event, warpRef.current);
    if (!dragging && editor.tool) {
      setHoveredThread(thread);
    }
    if (dragging && editor.tool) {
      setHoveredThread(null);
      const newWarp = Object.assign({}, warp);
      let lX = startThread; let hX = thread; let lY = startShaft; let hY = shaft;
      let xDirection = 1; let yDirection = 1;
      if (thread < startThread) {
        lX = thread;
        hX = startThread;
        xDirection = -1;
      }
      if (shaft < startShaft) {
        lY = shaft;
        hY = startShaft;
        yDirection = -1;
      }

      let x = xDirection > 0 ? lX : hX;
      let y = yDirection > 0 ? lY : hY;
      if (editor.tool === 'colour') {
        if (thread >= warp.threading.length) fillUpTo(newWarp, thread);
        newWarp.threading[thread].colour = editor.colour;
      }
      if (editor.tool === 'eraser') {
        if (thread >= warp.threading.length) fillUpTo(newWarp, thread);
        newWarp.threading[thread].shaft = 0;
      }
      if (editor.tool === 'straight') {
        while (x <= hX && x >= lX) {
          if (x >= warp.threading.length || warp.threading.length - x < 5) fillUpTo(newWarp, x + 5);
          newWarp.threading[x].shaft = y;
          x += xDirection;
          y += yDirection;
          if (y > hY || y < lY) y = yDirection > 0 ? lY : hY;
        }
      }
      if (editor.tool === 'point') {
        while (x <= hX && x >= lX) {
          if (x >= warp.threading.length || warp.threading.length - x < 5) fillUpTo(newWarp, x + 5);
          newWarp.threading[x].shaft = y;
          x += xDirection;
          y += yDirection;
          if (y > hY || y <= lY) yDirection = 0 - yDirection;
        }
      }
      if (editor.tool === 'select') {
        while (x <= hX && x >= lX) {
          newWarp.threading[x].isSelected = highlightMode;
          x += xDirection;
        }
      }
      updatePattern({ warp: newWarp });
    }
  };
  const click = (event) => {
    const { thread, shaft } = getThreadShaft(event, warpRef.current);
    if (editor.tool === 'point' || editor.tool === 'straight') {
      const newWarp = Object.assign({}, warp);
      if (thread > warp.threading.length || warp.threading.length - thread < 5) fillUpTo(newWarp, thread + 5);
      const warpThread = newWarp.threading[thread];
      warpThread.shaft = warpThread.shaft === shaft ? 0 : shaft;
      updatePattern({ warp: newWarp });
    }
    if (editor.tool === 'eraser') {
      const newWarp = Object.assign({}, warp);
      if (thread > warp.threading.length || warp.threading.length - thread < 5) fillUpTo(newWarp, thread + 5);
      const warpThread = newWarp.threading[thread];
      warpThread.shaft = 0;
      updatePattern({ warp: newWarp });
    }
    if (editor.tool === 'select') {
      const newWarp = Object.assign({}, warp);
      const warpThread = newWarp.threading[thread];
      warpThread.isSelected = highlightMode;
      updatePattern({ warp: newWarp });
    }
    if (editor.tool === 'insert') {
      dispatch(actions.objects.updateEditor({ insertType: 'warp', insertPoint: thread }));
      /*const number = parseInt(prompt('Enter a number of threads to insert before this point.'));
      if (number && number > 0) {
        const newThreads = [...new Array(number)].map(() => ({ shaft: 0 }));
        const newWarp = Object.assign({}, warp);
        newWarp.threading?.splice(thread, 0, ...newThreads);
        updatePattern({ warp: newWarp });
      }*/
    }
  };

  const fillUpTo = (w, limit) => {
    if (!editor.autoExtend) return;
    let i = warp.threading.length;
    while (i <= limit) {
      w.threading.push({ shaft: 0 });
      w.threads++;
      i++;
    }
  };

  const getMarker = (size) => {
    if (markers[size]) return markers[size];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = baseSize;
    m_canvas.height = baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'black';
    mc.fillRect(0, 0, baseSize, baseSize);
    markers[size] = m_canvas;
    return m_canvas;
  };
  const getSelectedMarker = (size, height) => {
    const m_canvas = document.createElement('canvas');
    m_canvas.width = baseSize + 1;
    m_canvas.height = height;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'rgb(233,245,248)';
    mc.fillRect(0, 1, baseSize, height);
    mc.moveTo(0, 0);
    mc.lineTo(baseSize+1, 0);
    mc.lineTo(baseSize+1, height);
    mc.lineTo(0, height);
    mc.lineTo(0, 0);
    mc.strokeStyle = 'rgb(99,184,205)';
    mc.stroke();
    return m_canvas;
  };
  const getHoveredMarker = (size, height) => {
    const m_canvas = document.createElement('canvas');
    m_canvas.width = baseSize + 1;
    m_canvas.height = height;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'azure';
    mc.fillRect(0, 1, baseSize, height);
    mc.moveTo(0, 0);
    mc.lineTo(baseSize+1, 0);
    mc.lineTo(baseSize+1, height);
    mc.lineTo(0, height);
    mc.lineTo(0, 0);
    mc.strokeStyle = 'rgb(99,184,205)';
    mc.stroke();
    return m_canvas;
  };

  const getSquare = (size, colour) => {
    if (squares[size] && squares[size][colour]) return squares[size][colour];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = baseSize;
    m_canvas.height = 10;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = utils.rgb(colour);
    mc.fillRect(0, 0, baseSize, 10);
    if (!squares[size]) squares[size] = {};
    squares[size][colour] = m_canvas;
    return m_canvas;
  };

  const paintDrawdown = () => {
    const canvas = warpRef.current;
    const colourway = colourwayRef.current;
    const ctx = canvas.getContext('2d');// , { alpha: false });
    const ctx2 = colourway.getContext('2d');// , { alpha: false });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = canvas.width; x >= 0; x -= baseSize) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, canvas.height);
    }
    for (let x = 0; x <= canvas.height; x += baseSize) {
      ctx.moveTo(0, 0.5 + x);
      ctx.lineTo(canvas.width, 0.5 + x);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    const selectedMarker = getSelectedMarker(baseSize, canvas.height);
    const hoveredMarker = getHoveredMarker(baseSize, canvas.height);
    const marker = getMarker(baseSize);
    for (let thread = 0; thread < warp.threading.length; thread++) {
      const shaft = warp.threading[thread].shaft;
      const isSelected = warp.threading[thread].isSelected;
      const isHovered = hoveredThread === thread;
      if (isSelected) {
        ctx.drawImage(selectedMarker, canvas.width - ((thread + 1) * baseSize), 0);
      }
      if (isHovered) {
        ctx.drawImage(hoveredMarker, canvas.width - ((thread + 1) * baseSize), 0);
      }
      ctx.drawImage(marker, canvas.width - ((thread + 1) * baseSize), canvas.height - (shaft * baseSize));
      const colourSquare = getSquare(baseSize, warp.threading[thread].colour || warp.defaultColour);
      ctx2.drawImage(colourSquare, canvas.width - ((thread + 1) * baseSize), 0);
    }
  };

  return (
    <WarpContainer treadles={weft.treadles} shafts={warp.shafts} baseSize={baseSize} tool={tool}>
      <Colourway className='warp-colourway joyride-warpColourway' ref={colourwayRef} width={warp.threading.length * baseSize} height={10} warp={warp} baseSize={baseSize}
        onClick={mouseClickColourway}
        onMouseDown={mouseDownColourway}
        onMouseMove={mouseMoveColourway}
        onMouseUp={mouseUpColourway}
        onMouseLeave={mouseUpColourway}
      />
      <WarpCanvas className='warp-threads joyride-warp' ref={warpRef} width={warp.threading.length * baseSize} height={warp.shafts * baseSize} warp={warp} baseSize={baseSize}
        onClick={click}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />
    </WarpContainer>
  );
}

export default Warp;
