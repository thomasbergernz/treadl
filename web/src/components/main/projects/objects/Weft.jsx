import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import utils from '../../../../utils/utils.js';

const StyledWeft = styled.div`
  top:0px;
  right:0px;
  position: absolute;
  top: ${props => (props.shafts * props.baseSize) + 20}px;
  right: 0;
  min-height: 1000px;
  width: ${props => (props.treadles * props.baseSize)}px;
  height: ${props => props.threads * props.baseSize}px;
  .weft-colourway{
    border:none;
    border-right:1px solid rgb(150,150,150);
  }
`;

// Cache
const squares = {};
const markers = {};

function Weft({ cellStyle, warp, weft, baseSize, updatePattern }) {
  const [draggingColourway, setDraggingColourway] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startTreadle, setStartTreadle] = useState();
  const [startThread, setStartThread] = useState();

  const { editor } = useSelector(state => ({ editor: state.objects.editor }));
  useEffect(() => paintDrawdown());
  const weftRef = useRef(null);
  const colourwayRef = useRef(null);

  const getThreadTreadle = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = (event.clientX - rect.left);
    const thread = parseInt(y / baseSize) + 1;
    const treadle = parseInt(x / baseSize);
    return { treadle, thread };
  };

  const mouseClickColourway = event => {
    const newWeft = Object.assign({}, weft);
    const { thread } = getThreadTreadle(event);
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
      const { thread } = getThreadTreadle(event);
      if (thread >= weft.treadling.length) fillUpTo(newWeft, thread);
      newWeft.treadling[thread - 1].colour = editor.colour;
      updatePattern({ weft: newWeft });
    }
  };

  const mouseUp = event => setDragging(false);
  const mouseDown = (event) => {
    event.preventDefault();
    const { treadle, thread } = getThreadTreadle(event);
    setStartTreadle(treadle);
    setStartThread(thread);
    setDragging(true);
  };
  const mouseMove = (event) => {
    if (dragging && editor.tool) {
      const newWeft = Object.assign({}, weft);
      const { treadle, thread } = getThreadTreadle(event);

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
      updatePattern({ weft: newWeft });
    }
  };
  const click = (event) => {
    if (editor.tool === 'point' || editor.tool === 'straight') {
      let { thread, treadle } = getThreadTreadle(event);
      treadle += 1;
      const newWeft = Object.assign({}, weft);
      if (thread >= newWeft.treadling.length || newWeft.treadling.length - thread < 5) fillUpTo(newWeft, thread + 5);
      const weftThread = newWeft.treadling[thread - 1];
      weftThread.treadle = weftThread.treadle === treadle ? 0 : treadle;
      updatePattern({ weft: newWeft });
    }
  };

  const fillUpTo = (weft, limit) => {
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

    for (let thread = 0; thread < weft.threads; thread++) {
      const treadle = weft.treadling[thread].treadle;
      const marker = getMarker(baseSize);
      ctx.drawImage(marker, ((treadle - 1) * baseSize), ((thread) * baseSize));
      const colourSquare = getSquare(baseSize, weft.treadling[thread].colour || weft.defaultColour);
      ctx2.drawImage(colourSquare, 0, (thread * baseSize));
    }
  }

  return (
    <StyledWeft baseSize={baseSize} treadles={weft.treadles} shafts={warp.shafts} threads={weft.threads}>
      <canvas className='weft-colourway' ref={colourwayRef} width={10} height={weft.threads * baseSize}
        style={{ position: 'absolute', top: 0, right: 0, width: 10, height: weft.threads * baseSize}}
        onClick={mouseClickColourway}
        onMouseDown={mouseDownColourway}
        onMouseMove={mouseMoveColourway}
        onMouseUp={mouseUpColourway}
        onMouseLeave={mouseUpColourway}
      />
      <canvas className='weft-threads joyride-weft' ref={weftRef} width={weft.treadles * baseSize} height={weft.threads * baseSize}
        style={{
          position: 'absolute',
          top: 0, right: 10, height: weft.threads * baseSize, width: weft.treadles * baseSize,
          borderRadius: 4, boxShadow: '0px 0px 10px rgba(0,0,0,0.15)',
        }}
        onClick={click}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />
    </StyledWeft>
  );
}

export default Weft;
