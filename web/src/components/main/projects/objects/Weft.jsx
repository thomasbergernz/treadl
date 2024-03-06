import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import utils from '../../../../utils/utils.js';
import actions from '../../../../actions';

const WeftContainer = styled.div`
  position: absolute;
  top: ${props => (props.shafts * props.baseSize) + 20}px;
  right: 0;
  min-height: 1000px;
  width: ${props => (props.treadles * props.baseSize)}px;
  height: ${props => props.threads * props.baseSize}px;
  cursor: ${props => props.tool === 'insert' ? 's-resize': 'initial'};
  .weft-colourway{
    border:none;
    border-right:1px solid rgb(150,150,150);
  }
`;

const WeftCanvas = styled.canvas`
  position: absolute;
  top: 0px;
  right: 10px;
  height: ${props => props.weft.treadling?.length * props.baseSize}px;
  width: ${props => props.weft.treadles * props.baseSize}px;
  border-radius: 4;
  box-shadow: 0px 0px 10px rgba(0,0,0,0.15);
`;

const Colourway = styled.canvas`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 10px;
  height: ${props => props.weft.treadling?.length * props.baseSize}px;
`;

const squares = {};
const markers = {};
let dragging = false;
let highlightMode = false; // true for highlighting, false for removing highlight
let startTreadle = null;
let startThread = null;
let weftTouchListeners = {};

function Weft({ cellStyle, warp, weft, baseSize, updatePattern }) {
  const [draggingColourway, setDraggingColourway] = useState(false);
  const [hoveredThread, setHoveredThread] = useState(null);
  const { editor } = useSelector(state => ({ editor: state.objects.editor }));
  const { tool, colour } = editor;
  const weftRef = useRef(null);
  const colourwayRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => paintDrawdown());
  useEffect(() => {
    const canvas = weftRef.current;
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
    }
    const onTouchMove = e => {
      e.preventDefault();
      mouseMove(new MouseEvent("mousemove", {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      }));
    };

    canvas.removeEventListener('touchstart', weftTouchListeners.touchStart);
    canvas.addEventListener("touchstart", onTouchStart, false);
    weftTouchListeners.touchStart = onTouchStart;

    canvas.removeEventListener('touchend', weftTouchListeners.touchEnd);
    canvas.addEventListener("touchend", onTouchEnd, false);
    weftTouchListeners.touchEnd = onTouchEnd;

    canvas.removeEventListener('touchmove', weftTouchListeners.touchMove);
    canvas.addEventListener("touchmove", onTouchMove, false);
    weftTouchListeners.touchMove = onTouchMove;
  }, [weftRef, tool, colour]);

  const getThreadTreadle = (event, element) => {
    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = (event.clientX - rect.left);
    const thread = parseInt(y / baseSize) + 1;
    const treadle = parseInt(x / baseSize);
    return { treadle, thread };
  };

  const mouseClickColourway = event => {
    const newWeft = Object.assign({}, weft);
    const { thread } = getThreadTreadle(event, colourwayRef.current);
    if (thread >= weft.treadling.length) fillUpTo(newWeft, thread);
    newWeft.treadling[thread - 1].colour = editor.colour;
    updatePattern({ weft: newWeft });
  };
  const mouseDownColourway = event => {
    event.preventDefault();
    setDraggingColourway(true);
  };
  const mouseUpColourway = event => setDraggingColourway(false);
  const mouseMoveColourway = (event) => {
    if (draggingColourway) {
      const newWeft = Object.assign({}, weft);
      const { thread } = getThreadTreadle(event, colourwayRef.current);
      if (thread >= weft.treadling.length) fillUpTo(newWeft, thread);
      newWeft.treadling[thread - 1].colour = editor.colour;
      updatePattern({ weft: newWeft });
    }
  };

  const mouseUp = event => {
    dragging = false;
    setHoveredThread(null);
  };
  const mouseDown = (event) => {
    event.preventDefault();
    const { treadle, thread } = getThreadTreadle(event, weftRef.current);
    startTreadle = treadle;
    startThread = thread;
    dragging = true;
    highlightMode = !weft?.treadling[thread - 1]?.isSelected;
  };
  const mouseMove = (event) => {
    const { treadle, thread } = getThreadTreadle(event, weftRef.current);
    if (!dragging && editor.tool) {
      setHoveredThread(thread - 1);
    }
    if (dragging && editor.tool) {
      setHoveredThread(null);
      const newWeft = Object.assign({}, weft);
      let lX = startTreadle; let hX = treadle; let lY = startThread; let hY = thread;
      let xDirection = 1; let
        yDirection = 1;
      if (treadle < startTreadle) {
        lX = treadle;
        hX = startTreadle;
        xDirection = -1;
      }
      if (thread < startThread) {
        lY = thread;
        hY = startThread;
        yDirection = -1;
      }
      let x = xDirection > 0 ? lX : hX;
      let y = yDirection > 0 ? lY : hY;
      if (editor.tool === 'colour') {
        if ((thread - 1) >= weft.treadling.length) fillUpTo(newWeft, (thread - 1));
        newWeft.treadling[thread - 1].colour = editor.colour;
      }
      if (editor.tool === 'eraser') {
        if ((thread - 1) >= weft.treadling.length) fillUpTo(newWeft, (thread - 1));
        newWeft.treadling[thread - 1].treadle = 0;
      }
      if (editor.tool === 'straight') {
        while (y <= hY && y >= lY) {
          if ((y - 1) >= weft.treadling.length || weft.treadling.length - y - 1 < 5) fillUpTo(newWeft, (y + 5));
          newWeft.treadling[y - 1].treadle = x + 1;
          x += xDirection;
          y += yDirection;
          if (x > hX || x < lX) x = xDirection > 0 ? lX : hX;
        }
      }
      if (editor.tool === 'point') {
        while (y <= hY && y >= lY) {
          if ((y - 1) >= weft.treadling.length || weft.treadling.length - y -1 < 5) fillUpTo(newWeft, y + 5);
          newWeft.treadling[y - 1].treadle = x + 1;
          x += xDirection;
          y += yDirection;
          if (x > hX || x <= lX) xDirection = 0 - xDirection;
        }
      }
      if (editor.tool === 'select') {
        while (y <= hY && y >= lY) {
          newWeft.treadling[y - 1].isSelected = highlightMode;
          y += yDirection;
        }
      }
      updatePattern({ weft: newWeft });
    }
  };
  const click = (event) => {
    let { thread, treadle } = getThreadTreadle(event, weftRef.current);
    if (editor.tool === 'point' || editor.tool === 'straight') {
      treadle += 1;
      const newWeft = Object.assign({}, weft);
      if (thread >= newWeft.treadling.length || newWeft.treadling.length - thread < 5) fillUpTo(newWeft, thread + 5);
      const weftThread = newWeft.treadling[thread - 1];
      weftThread.treadle = weftThread.treadle === treadle ? 0 : treadle;
      updatePattern({ weft: newWeft });
    }
    if (editor.tool === 'eraser') {
      treadle += 1;
      const newWeft = Object.assign({}, weft);
      if (thread >= newWeft.treadling.length || newWeft.treadling.length - thread < 5) fillUpTo(newWeft, thread + 5);
      const weftThread = newWeft.treadling[thread - 1];
      weftThread.treadle = 0;
      updatePattern({ weft: newWeft });
    }
    if (editor.tool === 'select') {
      const newWeft = Object.assign({}, weft);
      const weftThread = newWeft.treadling[thread - 1];
      weftThread.isSelected = highlightMode;
      updatePattern({ weft: newWeft });
    }
    if (editor.tool === 'insert') {
      dispatch(actions.objects.updateEditor({ insertType: 'weft', insertPoint: thread - 1 }));
    }
  };

  const fillUpTo = (weft, limit) => {
    if (!editor.autoExtend) return;
    let i = weft.treadling.length;
    while (i <= limit) {
      weft.treadling.push({ treadle: 0 });
      weft.threads++;
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
  const getSelectedMarker = (size, width) => {
    const m_canvas = document.createElement('canvas');
    m_canvas.width = width + 1;
    m_canvas.height = baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'rgb(233,245,248)';
    mc.fillRect(0, 1, width, baseSize);
    mc.moveTo(0, 0);
    mc.lineTo(width+1, 0);
    mc.lineTo(width+1, baseSize);
    mc.lineTo(0, baseSize);
    mc.lineTo(0, 0);
    mc.strokeStyle = 'rgb(99,184,205)';
    mc.stroke();
    return m_canvas;
  };
  const getHoveredMarker = (size, width) => {
    const m_canvas = document.createElement('canvas');
    m_canvas.width = width + 1;
    m_canvas.height = baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'azure';
    mc.fillRect(0, 1, width, baseSize);
    mc.moveTo(0, 0);
    mc.lineTo(width+1, 0);
    mc.lineTo(width+1, baseSize);
    mc.lineTo(0, baseSize);
    mc.lineTo(0, 0);
    mc.strokeStyle = 'rgb(99,184,205)';
    mc.stroke();
    return m_canvas;
  };

  const getSquare = (size, colour) => {
    if (squares[size] && squares[size][colour]) return squares[size][colour];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = 10;
    m_canvas.height = baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = utils.rgb(colour);
    mc.fillRect(0, 0, 10, baseSize);
    if (!squares[size]) squares[size] = {};
    squares[size][colour] = m_canvas;
    return m_canvas;
  };

  const paintDrawdown = () => {
    const canvas = weftRef.current;
    const colourway = colourwayRef.current;
    const ctx = canvas.getContext('2d');// , { alpha: false });
    const ctx2 = colourway.getContext('2d');// , { alpha: false });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x <= canvas.width; x += baseSize) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, canvas.height);
    }
    for (let x = 0; x <= canvas.height; x += baseSize) {
      ctx.moveTo(0, 0.5 + x);
      ctx.lineTo(canvas.width, 0.5 + x);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    const marker = getMarker(baseSize);
    const selectedMarker = getSelectedMarker(baseSize, canvas.width);
    const hoveredMarker = getHoveredMarker(baseSize, canvas.height);
    for (let thread = 0; thread < weft.treadling.length; thread++) {
      const treadle = weft.treadling[thread].treadle;
      const isSelected = weft.treadling[thread].isSelected;
      const isHovered = hoveredThread === thread;
      if (isSelected) {
        ctx.drawImage(selectedMarker, 0, ((thread) * baseSize));
      }
      if (isHovered) {
        ctx.drawImage(hoveredMarker, 0, ((thread) * baseSize));
      }
      ctx.drawImage(marker, ((treadle - 1) * baseSize), ((thread) * baseSize));
      const colourSquare = getSquare(baseSize, weft.treadling[thread].colour || weft.defaultColour);
      ctx2.drawImage(colourSquare, 0, (thread * baseSize));
    }
  }

  const threadCount = weft.treadling?.length || 0;
  return (
    <WeftContainer baseSize={baseSize} treadles={weft.treadles} shafts={warp.shafts} threads={threadCount} tool={tool}>
      <Colourway className='weft-colourway' ref={colourwayRef} width={10} height={threadCount * baseSize} weft={weft} baseSize={baseSize}
        onClick={mouseClickColourway}
        onMouseDown={mouseDownColourway}
        onMouseMove={mouseMoveColourway}
        onMouseUp={mouseUpColourway}
        onMouseLeave={mouseUpColourway}
      />
      <WeftCanvas className='weft-threads joyride-weft' ref={weftRef} width={weft.treadles * baseSize} height={threadCount * baseSize} weft={weft} baseSize={baseSize}
        onClick={click}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />
    </WeftContainer>
  );
}

export default Weft;
