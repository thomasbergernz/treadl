import React, { Component } from 'react';
import styled from 'styled-components';

const StyledTieups = styled.canvas`
  position:absolute;
  top:10px;
  right:10px;
`;

class Tieups extends Component {

  componentDidUpdate(prevProps, prevState) {
    this.paintTieups();
  }
  componentDidMount() {
    this.paintTieups();
  }

  fillUpTo = (tieups, limit) => {
    let i = tieups.length;
    while (i <= limit) {
      tieups.push([]);
      i++;
    }
  }
  getTieupShaft = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = 0 - (event.clientX - rect.right);
    const shaft = this.props.warp.shafts - parseInt(y / this.props.baseSize);
    const tieup = this.props.weft.treadles - parseInt(x / this.props.baseSize) - 1;
    return { tieup, shaft };
  }
  click = (event) => {
    const { tieup, shaft } = this.getTieupShaft(event);
    const tieups = Object.assign([], this.props.tieups);

    if (tieup >= tieups.length) this.fillUpTo(tieups, tieup);
    if (tieups[tieup] !== undefined) {
      if (tieups[tieup].indexOf(shaft) === -1) tieups[tieup].push(shaft);
      else tieups[tieup].splice(tieups[tieup].indexOf(shaft));
    }
    this.props.updatePattern({ tieups });
  }

  paintTieups() {
    const canvas = this.refs.tieups;
    const ctx = canvas.getContext('2d');// , { alpha: false });
    const { baseSize, tieups } = this.props;

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

  render() {
    const { warp, weft, baseSize } = this.props;
    return (
      <StyledTieups ref='tieups' className='tieups joyride-tieups' width={weft.treadles * baseSize} height= {warp.shafts * baseSize} style={{width: weft.treadles * baseSize, height: warp.shafts * baseSize}} onClick={this.click}/>
    );
  }
}

export default Tieups;
