import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';

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

class Weft extends Component {
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

  toggleWeft = (treadle, threadCount) => {
    const weft = Object.assign({}, this.props.weft);
    const thread = weft.treadling[threadCount];
    thread.treadle = thread.treadle === treadle ? 0 : treadle;
    this.props.updatePattern({ weft });
  }

  changeWeftColour = (threadIndex) => {
    const weft = Object.assign({}, this.props.weft);
    const colour = this.props.colour;
    if (colour) {
      weft.treadling[threadIndex].colour = colour;
      this.props.updatePattern({ weft });
    }
  }

  getThreadTreadle = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const x = (event.clientX - rect.left);
    const thread = parseInt(y / this.props.baseSize) + 1;
    const treadle = parseInt(x / this.props.baseSize);
    return { treadle, thread };
  }

  mouseClickColourway = event => {
    const weft = Object.assign({}, this.props.weft);
    const { thread } = this.getThreadTreadle(event);
    if (thread >= weft.treadling.length) this.fillUpTo(weft, thread);
    weft.treadling[thread - 1].colour = this.props.colour;
    this.props.updatePattern({ weft });
  }
  mouseDownColourway = event => {
    event.preventDefault();
    this.draggingColourway = true;
  }
  mouseUpColourway = event => this.draggingColourway = false;
  mouseMoveColourway = (event) => {
    if (this.draggingColourway) {
      const weft = Object.assign({}, this.props.weft);
      const { thread } = this.getThreadTreadle(event);
      if (thread >= weft.treadling.length) this.fillUpTo(weft, thread);
      weft.treadling[thread - 1].colour = this.props.colour;
      this.props.updatePattern({ weft });
    }
  }

  mouseUp = event => this.dragging = false;
  mouseDown = (event) => {
    event.preventDefault();
    const { treadle, thread } = this.getThreadTreadle(event);
    this.startTreadle = treadle;
    this.startThread = thread;
    this.dragging = true;
  }
  mouseMove = (event) => {
    if (this.dragging && this.props.tool) {
      const weft = Object.assign({}, this.props.weft);
      const { treadle, thread } = this.getThreadTreadle(event);

      let lX = this.startTreadle; let hX = treadle; let lY = this.startThread; let
        hY = thread;
      let xDirection = 1; let
        yDirection = 1;
      if (treadle < this.startTreadle) {
        lX = treadle;
        hX = this.startTreadle;
        xDirection = -1;
      }
      if (thread < this.startThread) {
        lY = thread;
        hY = this.startThread;
        yDirection = -1;
      }
      let x = xDirection > 0 ? lX : hX;
      let y = yDirection > 0 ? lY : hY;
      if (this.props.tool === 'colour') {
        if ((thread - 1) >= weft.treadling.length) this.fillUpTo(weft, (thread - 1));
        weft.treadling[thread - 1].colour = this.props.colour;
      }
      if (this.props.tool === 'straight') {
        while (y <= hY && y >= lY) {
          if ((y - 1) >= weft.treadling.length || weft.treadling.length - y - 1 < 5) this.fillUpTo(weft, (y + 5));
          weft.treadling[y - 1].treadle = x + 1;
          x += xDirection;
          y += yDirection;
          if (x > hX || x < lX) x = xDirection > 0 ? lX : hX;
        }
      }
      if (this.props.tool === 'point') {
        while (y <= hY && y >= lY) {
          if ((y - 1) >= weft.treadling.length || weft.treadling.length - y -1 < 5) this.fillUpTo(weft, y + 5);
          weft.treadling[y - 1].treadle = x + 1;
          x += xDirection;
          y += yDirection;
          if (x > hX || x <= lX) xDirection = 0 - xDirection;
        }
      }
      this.props.updatePattern({ weft });
    }
  }
  click = (event) => {
    if (this.props.tool === 'point' || this.props.tool === 'straight') {
      let { thread, treadle } = this.getThreadTreadle(event);
      treadle += 1;
      const weft = Object.assign({}, this.props.weft);
      if (thread >= weft.treadling.length || weft.treadling.length - thread < 5) this.fillUpTo(weft, thread + 5);
      const weftThread = weft.treadling[thread - 1];
      weftThread.treadle = weftThread.treadle === treadle ? 0 : treadle;
      this.props.updatePattern({ weft });
    }
  }

  fillUpTo = (weft, limit) => {
    let i = weft.treadling.length;
    while (i <= limit) {
      weft.treadling.push({ treadle: 0 });
      weft.threads++;
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
    m_canvas.width = 10;
    m_canvas.height = this.props.baseSize;
    const mc = m_canvas.getContext('2d');
    mc.fillStyle = utils.rgb(colour);
    mc.fillRect(0, 0, 10, this.props.baseSize);
    if (!this.squares[size]) this.squares[size] = {};
    this.squares[size][colour] = m_canvas;
    return m_canvas;
  }

  paintDrawdown() {
    const canvas = this.refs.weft;
    const colourway = this.refs.colourway;
    const ctx = canvas.getContext('2d');// , { alpha: false });
    const ctx2 = colourway.getContext('2d');// , { alpha: false });
    const { baseSize, weft } = this.props;

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
      const marker = this.getMarker(baseSize);
      ctx.drawImage(marker, ((treadle - 1) * this.props.baseSize), ((thread) * this.props.baseSize));
      const colourSquare = this.getSquare(baseSize, weft.treadling[thread].colour || weft.defaultColour);
      ctx2.drawImage(colourSquare, 0, (thread * this.props.baseSize));
    }
  }



  render() {
    const { warp, weft, baseSize } = this.props;
    return (
      <StyledWeft baseSize={baseSize} treadles={weft.treadles} shafts={warp.shafts} threads={weft.threads}>
        <canvas className='weft-colourway' ref="colourway" width={10} height={weft.threads * baseSize}
          style={{ position: 'absolute', top: 0, right: 0, width: 10, height: weft.threads * baseSize}}
          onClick={this.mouseClickColourway}
          onMouseDown={this.mouseDownColourway}
          onMouseMove={this.mouseMoveColourway}
          onMouseUp={this.mouseUpColourway}
          onMouseLeave={this.mouseUpColourway}
        />
        <canvas className='weft-threads joyride-weft' ref="weft" width={weft.treadles * baseSize} height={weft.threads * baseSize}
          style={{
            position: 'absolute',
            top: 0, right: 10, height: weft.threads * baseSize, width: weft.treadles * baseSize,
            borderRadius: 4, boxShadow: '0px 0px 10px rgba(0,0,0,0.15)',
          }}
          onClick={this.click}
          onMouseDown={this.mouseDown}
          onMouseMove={this.mouseMove}
          onMouseUp={this.mouseUp}
          onMouseLeave={this.mouseUp}
        />
      </StyledWeft>
    );
  }
}

const mapStateToProps = (state, ownProps) => state.objects.editor;
const mapDispatchToProps = dispatch => ({
});
const WeftContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(Weft);

export default WeftContainer;
