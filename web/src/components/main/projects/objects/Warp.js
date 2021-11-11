import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import utils from 'utils/utils.js';

const StyledWarp = styled.div`
  top:0px;
  right:0px;
  position: absolute;
  right: ${props => (props.treadles * props.baseSize) + 20}px;
  height: ${props => (props.shafts * props.baseSize) + 10}px;
  width: 2000;
  .warp-colourway td{
    border:none;
    border-top:1px solid rgb(150,150,150);
  }
`;

class Warp extends Component {
  constructor(props) {
    super(props);
    this.squares = {};
    this.markers = {};
  }
  componentDidUpdate(prevProps, prevState) {
    this.paintDrawdown();
  }
  componentDidMount() {
    this.paintDrawdown();
  }

  getThreadShaft = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = 0 - (event.clientX - rect.right);
    const shaft = this.props.warp.shafts - parseInt(y / this.props.baseSize);
    const thread = parseInt(x / this.props.baseSize);
    return { shaft, thread };
  }

  mouseClickColourway = event => {
    const warp = Object.assign({}, this.props.warp);
    const { thread } = this.getThreadShaft(event);
    if (thread >= warp.threading.length) this.fillUpTo(warp, thread);
    warp.threading[thread].colour = this.props.colour;
    this.props.updatePattern({ warp });
  }
  mouseDownColourway = event => {
    event.preventDefault();
    this.draggingColourway = true;
  }
  mouseUpColourway = event => this.draggingColourway = false;
  mouseMoveColourway = (event) => {
    if (this.draggingColourway) {
      const warp = Object.assign({}, this.props.warp);
      const { thread } = this.getThreadShaft(event);
      if (thread >= warp.threading.length) this.fillUpTo(warp, thread);
      warp.threading[thread].colour = this.props.colour;
      this.props.updatePattern({ warp });
    }
  }

  mouseUp = event => this.dragging = false;
  mouseDown = (event) => {
    event.preventDefault();
    const { shaft, thread } = this.getThreadShaft(event);
    this.startShaft = shaft;
    this.startThread = thread;
    this.dragging = true;
  }
  mouseMove = (event) => {
    if (this.dragging && this.props.tool) {
      const warp = Object.assign({}, this.props.warp);
      const { shaft, thread } = this.getThreadShaft(event);

      let lX = this.startThread; let hX = thread; let lY = this.startShaft; let
        hY = shaft;
      let xDirection = 1; let
        yDirection = 1;
      if (thread < this.startThread) {
        lX = thread;
        hX = this.startThread;
        xDirection = -1;
      }
      if (shaft < this.startShaft) {
        lY = shaft;
        hY = this.startShaft;
        yDirection = -1;
      }

      let x = xDirection > 0 ? lX : hX;
      let y = yDirection > 0 ? lY : hY;
      if (this.props.tool === 'colour') {
        if (thread >= warp.threading.length) this.fillUpTo(warp, thread);
        warp.threading[thread].colour = this.props.colour;
      }
      if (this.props.tool === 'straight') {
        while (x <= hX && x >= lX) {
          if (x >= warp.threading.length || warp.threading.length - x < 5) this.fillUpTo(warp, x + 5);
          warp.threading[x].shaft = y;
          x += xDirection;
          y += yDirection;
          if (y > hY || y < lY) y = yDirection > 0 ? lY : hY;
        }
      }
      if (this.props.tool === 'point') {
        while (x <= hX && x >= lX) {
          if (x >= warp.threading.length || warp.threading.length - x < 5) this.fillUpTo(warp, x + 5);
          warp.threading[x].shaft = y;
          x += xDirection;
          y += yDirection;
          if (y > hY || y <= lY) yDirection = 0 - yDirection;
        }
      }
      this.props.updatePattern({ warp });
    }
  }
  click = (event) => {
    if (this.props.tool === 'point' || this.props.tool === 'straight') {
      const { thread, shaft } = this.getThreadShaft(event);
      const warp = Object.assign({}, this.props.warp);
      if (thread > warp.threading.length || warp.threading.length - thread < 5) this.fillUpTo(warp, thread + 5);
      const warpThread = warp.threading[thread];
      warpThread.shaft = warpThread.shaft === shaft ? 0 : shaft;
      this.props.updatePattern({ warp });
    }
  }

  fillUpTo = (warp, limit) => {
    let i = warp.threading.length;
    while (i <= limit) {
      warp.threading.push({ shaft: 0 });
      warp.threads++;
      i++;
    }
  }


  getMarker(size) {
    if (this.markers[size]) return this.markers[size];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = this.props.baseSize;
    m_canvas.height = this.props.baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = 'black';
    mc.fillRect(0, 0, this.props.baseSize, this.props.baseSize);
    this.markers[size] = m_canvas;
    return m_canvas;
  }

  getSquare(size, colour) {
    if (this.squares[size] && this.squares[size][colour]) return this.squares[size][colour];
    const m_canvas = document.createElement('canvas');
    m_canvas.width = this.props.baseSize;
    m_canvas.height = 10;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = utils.rgb(colour);
    mc.fillRect(0, 0, this.props.baseSize, 10);
    if (!this.squares[size]) this.squares[size] = {};
    this.squares[size][colour] = m_canvas;
    return m_canvas;
  }

  paintDrawdown() {
    const canvas = this.refs.warp;
    const colourway = this.refs.colourway;
    const ctx = canvas.getContext('2d');// , { alpha: false });
    const ctx2 = colourway.getContext('2d');// , { alpha: false });
    const { baseSize, warp } = this.props;

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
      const marker = this.getMarker(baseSize);
      ctx.drawImage(marker, canvas.width - ((thread + 1) * this.props.baseSize), canvas.height - (shaft * this.props.baseSize));
      const colourSquare = this.getSquare(baseSize, warp.threading[thread].colour || warp.defaultColour);
      ctx2.drawImage(colourSquare, canvas.width - ((thread + 1) * this.props.baseSize), 0);
    }
  }

  

  render() {
    const { warp, weft, baseSize } = this.props;
    return (
      <StyledWarp treadles={weft.treadles} shafts={warp.shafts} baseSize={baseSize}>
        <canvas className='warp-colourway' ref="colourway" width={2000} height={10}
          style={{
            position: 'absolute', top: 0, right: 0, height: 10, width: 2000,
          }}
          onClick={this.mouseClickColourway}
          onMouseDown={this.mouseDownColourway}
          onMouseMove={this.mouseMoveColourway}
          onMouseUp={this.mouseUpColourway}
          onMouseLeave={this.mouseUpColourway}
        />
        <canvas className='warp-threads' ref="warp" width={2000} height={warp.shafts * baseSize}
          style={{
            position: 'absolute', top: 10, right: 0,
            height: warp.shafts * baseSize,
            width: 2000, borderRadius: 4,
            boxShadow: '0px 0px 10px rgba(0,0,0,0.15)',
          }}
          onClick={this.click}
          onMouseDown={this.mouseDown}
          onMouseMove={this.mouseMove}
          onMouseUp={this.mouseUp}
          onMouseLeave={this.mouseUp}
        />
      </StyledWarp>
    );
  }
}

const mapStateToProps = (state, ownProps) => state.objects.editor;
const mapDispatchToProps = dispatch => ({
});
const WarpContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(Warp);

export default WarpContainer;
