import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import utils from 'utils/utils';

const StyledDrawdown = styled.canvas`
  position:absolute;
  border:1px dashed rgb(70,70,70);
  top: ${props => (props.warp.shafts * props.baseSize) + 20}px;
  right: ${props => (props.weft.treadles * props.baseSize) + 20}px;
  height: ${props => props.weft.threads * props.baseSize}px;
  width: ${props => props.warp.threads * props.baseSize}px;
`;

// Cache
const squares = {};

function Drawdown({ baseSize, warp, weft, tieups }) {
  const drawdownRef = useRef();
  useEffect(() => paintDrawdown());
  const { editor } = useSelector(state => ({ editor: state.objects.editor }));

  const getSquare = (thread, size, colour) => {
    const { view } = editor;
    if (squares[view] && squares[view][thread] && squares[view][thread][size] && squares[view][thread][size][colour]) return squares[view][thread][size][colour];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = size;
    m_canvas.height = size;
    const mc = m_canvas.getContext('2d');

    if (view === 'warp' || view === 'weft') {
      if (view === thread) mc.fillStyle = 'black';
      else mc.fillStyle = 'white';
      mc.fillRect(0, 0, size, size);
    }

    if (view === 'colour' || view === 'interlacement') {
      mc.fillStyle = colour;
      mc.fillRect(0, 0, size, size);
      if (editor.view === 'interlacement') {
        if (thread === 'warp') {
          const grd = mc.createLinearGradient(0, 0, size, 0);
          grd.addColorStop(0.1, 'rgba(0,0,0,0.3)');
          grd.addColorStop(0.5, 'rgba(250,250,250,0.01)');
          grd.addColorStop(0.9, 'rgba(0,0,0,0.3)');
          mc.fillStyle = grd;
          mc.fillRect(0, 0, size, size);
        }
        if (thread === 'weft') {
          const grd = mc.createLinearGradient(0, 0, 0, size);
          grd.addColorStop(0.1, 'rgba(0,0,0,0.3)');
          grd.addColorStop(0.5, 'rgba(250,250,250,0.01)');
          grd.addColorStop(0.9, 'rgba(0,0,0,0.3)');
          mc.fillStyle = grd;
          mc.fillRect(0, 0, size, size);
        }
      }
    }

    if (!squares[view]) squares[view] = {};
    if (!squares[view][thread]) squares[view][thread] = {};
    if (!squares[view][thread][size]) squares[view][thread][size] = {};
    squares[view][thread][size][colour] = m_canvas;
    return m_canvas;
  };

  const paintDrawdown = () => {
    const canvas = drawdownRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    for (let tread = 0; tread < weft.threads; tread++) {
      for (let thread = 0; thread < warp.threads; thread++) {
        const treadle = weft.treadling[tread].treadle > weft.treadles ? 0 : weft.treadling[tread].treadle;
        const shaft = warp.threading[thread].shaft;
        const tieup = tieups[treadle - 1];
        const proceed = true;
        if (proceed) {
          const weftColour = utils.rgb(weft.treadling[tread].colour || weft.defaultColour);
          const warpColour = utils.rgb(warp.threading[thread].colour || warp.defaultColour);
          const threadType = tieup && tieup.filter(t => t <= warp.shafts).indexOf(shaft) > -1 ? 'warp' : 'weft';
          const square = getSquare(threadType, baseSize, threadType === 'warp' ? warpColour : weftColour);

          ctx.drawImage(square, canvas.width - (baseSize * (thread + 1)), tread * baseSize);
        }
      }
    }
  };

  return (
    <StyledDrawdown ref={drawdownRef} className="drawdown joyride-drawdown"
      width={warp.threads * baseSize}
      height={weft.threads * baseSize}
      weft={weft} warp={warp} baseSize={baseSize}
    />
  );
}

export default Drawdown;
