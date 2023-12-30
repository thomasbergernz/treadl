import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const StyledTieups = styled.canvas`
  position: absolute;
  top: 10px;
  ${props => props.viewingBack ? 'left' : 'right'}: 10px;
`;

function Tieups({ cellStyle, warp, weft, tieups, updatePattern, baseSize }) {
  useEffect(() => paintTieups());
  const tieupRef = useRef(null);
  const { editor } = useSelector(state => ({ editor: state.objects.editor }));
  const { viewingBack } = editor;

  const fillUpTo = (t, limit) => {
    let i = t.length;
    while (i <= limit) {
      t.push([]);
      i++;
    }
  };
  const getTieupShaft = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = 0 - (event.clientX - rect.right);
    const shaft = warp.shafts - parseInt(y / baseSize);
    const tieup = weft.treadles - parseInt(x / baseSize) - 1;
    return { tieup, shaft };
  };
  const click = (event) => {
    const { tieup, shaft } = getTieupShaft(event);
    const newTieups = Object.assign([], tieups);

    if (tieup >= tieups.length) fillUpTo(newTieups, tieup);
    if (tieups[tieup] !== undefined) {
      if (tieups[tieup].indexOf(shaft) === -1) newTieups[tieup].push(shaft);
      else newTieups[tieup].splice(tieups[tieup].indexOf(shaft));
    }
    updatePattern({ tieups: newTieups });
  };

  const paintTieups = () => {
    const canvas = tieupRef.current;
    const ctx = canvas.getContext('2d');

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
    ctx.fillStyle = 'black';
    for (let tieup = 0; tieup < tieups.length; tieup += 1) {
      for (let shaft = 0; shaft < tieups[tieup].length; shaft += 1) {
        ctx.fillRect(tieup * baseSize, canvas.height - ((tieups[tieup][shaft]) * baseSize), baseSize, baseSize);
      }
    }
  }

  return (
    <StyledTieups ref={tieupRef} className='tieups joyride-tieups' viewingBack={viewingBack} width={weft.treadles * baseSize} height= {warp.shafts * baseSize} style={{width: weft.treadles * baseSize, height: warp.shafts * baseSize}} onClick={click}/>
  );
}

export default Tieups;
