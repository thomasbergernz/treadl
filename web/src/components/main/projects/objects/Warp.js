import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import utils from 'utils/utils.js';

const StyledWarp = styled.div`
  top:0px;
  right:0px;
  position: absolute;
  right: ${props => (props.treadles * props.baseSize) + 20}px;
  height: ${props => (props.shafts * props.baseSize) + 10}px;
  width: ${props => (props.threading * props.baseSize) + 10}px;
  .warp-colourway td{
    border:none;
    border-top:1px solid rgb(150,150,150);
  }
`;

const squares = {};
const markers = {};

function Warp({ baseSize, cellStyle, warp, weft, updatePattern }) {
  const [draggingColourway, setDraggingColourway] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startShaft, setStartShaft] = useState();
  const [startThread, setStartThread] = useState();

  const { editor } = useSelector(state => ({ editor: state.objects.editor }));
  useEffect(() => paintDrawdown());
  const warpRef = useRef(null);
  const colourwayRef = useRef(null);

  const getThreadShaft = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = 0 - (event.clientX - rect.right);
    const shaft = warp.shafts - parseInt(y / baseSize);
    const thread = parseInt(x / baseSize);
    return { shaft, thread };
  };

  const mouseClickColourway = event => {
    const newWarp = Object.assign({}, warp);
    const { thread } = getThreadShaft(event);
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
      const { thread } = getThreadShaft(event);
      if (thread >= warp.threading.length) fillUpTo(newWarp, thread);
      newWarp.threading[thread].colour = editor.colour;
      updatePattern({ warp: newWarp });
    }
  };

  const mouseUp = event => setDragging(false);
  const mouseDown = (event) => {
    event.preventDefault();
    const { shaft, thread } = getThreadShaft(event);
    setStartShaft(shaft);
    setStartThread(thread);
    setDragging(true);
  };
  const mouseMove = (event) => {
    if (dragging && editor.tool) {
      const newWarp = Object.assign({}, warp);
      const { shaft, thread } = getThreadShaft(event);

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
      updatePattern({ warp: newWarp });
    }
  };
  const click = (event) => {
    if (editor.tool === 'point' || editor.tool === 'straight') {
      const { thread, shaft } = getThreadShaft(event);
      const newWarp = Object.assign({}, warp);
      if (thread > warp.threading.length || warp.threading.length - thread < 5) fillUpTo(newWarp, thread + 5);
      const warpThread = newWarp.threading[thread];
      warpThread.shaft = warpThread.shaft === shaft ? 0 : shaft;
      updatePattern({ warp: newWarp });
    }
  };

  const fillUpTo = (w, limit) => {
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

    for (let thread = 0; thread < warp.threads; thread++) {
      const shaft = warp.threading[thread].shaft;
      const marker = getMarker(baseSize);
      ctx.drawImage(marker, canvas.width - ((thread + 1) * baseSize), canvas.height - (shaft * baseSize));
      const colourSquare = getSquare(baseSize, warp.threading[thread].colour || warp.defaultColour);
      ctx2.drawImage(colourSquare, canvas.width - ((thread + 1) * baseSize), 0);
    }
  };

  return (
    <StyledWarp treadles={weft.treadles} shafts={warp.shafts} baseSize={baseSize}>
      <canvas className='warp-colourway joyride-warpColourway' ref={colourwayRef} width={warp.threading.length * baseSize} height={10}
        style={{
          position: 'absolute', top: 0, right: 0, height: 10, width: warp.threading.length * baseSize,
        }}
        onClick={mouseClickColourway}
        onMouseDown={mouseDownColourway}
        onMouseMove={mouseMoveColourway}
        onMouseUp={mouseUpColourway}
        onMouseLeave={mouseUpColourway}
      />
      <canvas className='warp-threads joyride-warp' ref={warpRef} width={warp.threading.length * baseSize} height={warp.shafts * baseSize}
        style={{
          position: 'absolute', top: 10, right: 0,
          height: warp.shafts * baseSize,
          width: warp.threading.length * baseSize, borderRadius: 4,
          boxShadow: '0px 0px 10px rgba(0,0,0,0.15)',
        }}
        onClick={click}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />
    </StyledWarp>
  );
}

export default Warp;
