import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import {  Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import ElementPan from 'components/includes/ElementPan';
import HelpLink from 'components/includes/HelpLink';
import Tour, { ReRunTour } from 'components/includes/Tour';

import Warp from './Warp.js';
import Weft from './Weft.js';
import Tieups from './Tieups.js';
import Drawdown from './Drawdown.js';
import Tools from './Tools.js';

import api from 'api';
import actions from 'actions';

export const StyledPattern = styled.div`
  position:relative;
  min-width:100%;
  width:0px;
  height:0px;
  margin:20px;
`;

class Draft extends Component {
  constructor(props) {
    super(props);
    this.state = { unsaved: false, saving: false };
  }

  componentDidMount() {
    api.objects.get(this.props.match.params.objectId, (object) => {
      if (!object.pattern.baseSize) object.pattern.baseSize = 10;
      this.setState(object);
    });
  }

  updateObject = (update) => {
    this.setState(Object.assign({}, this.state, update));
    this.setState({ unsaved: true });
  }

  updatePattern = (update) => {
    const newPattern = Object.assign({}, this.state.pattern, update);
    this.setState(Object.assign({}, this.state, { pattern: newPattern }));
    this.setState({ unsaved: true });
  }

  saveObject = () => {
    this.setState({ saving: true });
    const canvas = document.getElementsByClassName('drawdown')[0];
    const object = Object.assign({}, this.state);
    object.preview = canvas.toDataURL();
    api.objects.update(this.props.match.params.objectId, object, (o) => {
      toast.success('Pattern saved');
      this.props.onReceiveObject(o);
      this.setState({ unsaved: false, saving: false });
    }, (err) => {
      toast.error(err.message);
      this.setState({ saving: false });
    });
  }

  rerunTour = () => {

  }

  render() {
    if (!this.state.pattern) return null;
    const { unsaved, saving } = this.state;
    const { warp, weft, tieups, baseSize } = this.state.pattern;
    const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
    return (
      <div>
        <Helmet title={`${this.state?.name || 'Weaving Draft'}`} />
        <Prompt
          when={unsaved ? true : false}
          message='You have unsaved changes. Are you sure you want to leave tnis page?'
        />
        <Tour id='pattern' run={true} />
        <div style={{display: 'flex'}}>

          <div style={{flex: 1, overflow: 'hidden'}}>
            <ElementPan
              disabled={!(this.props.editor && this.props.editor.tool === 'pan')}
              startX={5000}
              startY={0}
            >
              <StyledPattern
                style={{
                  width:  `${warp.threads * baseSize + weft.treadles * baseSize + 20}px`,
                  height: '1000px', // `${warp.shafts * baseSize + weft.threads * baseSize + 20}px`
                }}
              >

                <Warp baseSize={baseSize} cellStyle={cellStyle} warp={warp} weft={weft} updatePattern={this.updatePattern} />
                <Weft cellStyle={cellStyle} warp={warp} weft={weft} baseSize={baseSize} updatePattern={this.updatePattern} />
                <Tieups cellStyle={cellStyle} warp={warp} weft={weft} tieups={tieups} updatePattern={this.updatePattern} baseSize={baseSize}/>
                <Drawdown warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} />

              </StyledPattern>
            </ElementPan>
          </div>

          <div style={{width: 300, marginLeft: 20}}>
            <HelpLink className='joyride-help' link={`${process.env.REACT_APP_SUPPORT_ROOT}Editing-patterns#using-the-pattern-editor`} marginBottom/>
            <ReRunTour id='pattern' />
            <Tools warp={warp} weft={weft} object={this.state} pattern={this.state.pattern} updateObject={this.updateObject} updatePattern={this.updatePattern} saveObject={this.saveObject} baseSize={baseSize} unsaved={unsaved} saving={saving}/>
          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({ editor: state.objects.editor });
const mapDispatchToProps = dispatch => ({
  onReceiveObject: object => dispatch(actions.objects.receive(object)),
});
const DraftContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(Draft);

export default DraftContainer;
