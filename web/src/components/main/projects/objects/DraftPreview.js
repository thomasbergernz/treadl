import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader } from 'semantic-ui-react';
import actions from 'actions';
import api from 'api';

import ElementPan from 'components/includes/ElementPan';
import { StyledPattern } from 'components/main/projects/objects/Draft';
import Warp from './Warp.js';
import Weft from './Weft.js';
import Tieups from './Tieups.js';
import Drawdown from './Drawdown.js';

class DraftPreview extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  componentDidMount() {
    this.props.onEditorUpdated({ tool: 'pan' });
    this.setState({ loading: true });
    api.objects.get(this.props.object._id, (object) => {
      this.setState({ loading: false });
      if (object.pattern && object.pattern.warp) {
        this.setState(object, () => {
          if (this.props.onImageLoaded) this.unifyCanvas();
        });
      }
      if (!object.preview) {
        setTimeout(() => {
          const c = document.getElementsByClassName('drawdown')[0];
          const preview = c && c.toDataURL();
          if (preview) {
            api.objects.update(object._id, { preview }, () => {
              this.props.onEditObject(object._id, 'preview', preview);
            });
          }
        }, 1000);
      }
    }, err => this.setState({ loading: false }));
  }

  unifyCanvas() {
    setTimeout(() => {
      const id = this.props.object._id;
      const { warp, weft } = this.state.pattern;
      const baseSize = 6;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = warp.threads * baseSize + weft.treadles * baseSize + 20;
      canvas.height = warp.shafts * baseSize + weft.threads * baseSize + 20;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      const warpCanvas = document.querySelector(`.preview-${id} .warp-threads`);
      const warpColourwayCanvas = document.querySelector(`.preview-${id} .warp-colourway`);
      const weftCanvas = document.querySelector(`.preview-${id} .weft-threads`);
      const weftColourwayCanvas = document.querySelector(`.preview-${id} .weft-colourway`);
      const drawdownCanvas = document.querySelector(`.preview-${id} .drawdown`);
      const tieupsCanvas = document.querySelector(`.preview-${id} .tieups`);
      ctx.drawImage(warpColourwayCanvas, canvas.width - warpCanvas.width - weft.treadles * baseSize - 20, 0);
      ctx.drawImage(warpCanvas, canvas.width - warpCanvas.width - weft.treadles * baseSize - 20, 10);
      ctx.drawImage(weftCanvas, canvas.width - 10 - weft.treadles * baseSize, warp.shafts * baseSize + 20);
      ctx.drawImage(weftColourwayCanvas, canvas.width - 10, warp.shafts * baseSize + 20);
      ctx.drawImage(tieupsCanvas, canvas.width - weft.treadles * baseSize - 10, 10);
      ctx.drawImage(drawdownCanvas, canvas.width - drawdownCanvas.width - weft.treadles * baseSize - 20, warp.shafts * baseSize + 20);

      this.props.onImageLoaded(canvas.toDataURL());
    }, 500);
  }

  render() {
    if (this.state.loading) return <Loader active />;
    if (!this.state.pattern) return null;
    const { warp, weft, tieups } = this.state.pattern;
    if (!warp || !weft || !tieups) return null;
    const baseSize = 6;
    const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
    return (
      <ElementPan
        startX={5000}
        startY={0}
      >
        <StyledPattern
          className={`pattern preview-${this.props.object._id}`}
          style={{
            width: '2000px',
            height: '1000px',
          }}
        >
          <Warp baseSize={baseSize} cellStyle={cellStyle} warp={warp} weft={weft} updatePattern={() => {}} />
          <Weft cellStyle={cellStyle} warp={warp} weft={weft} baseSize={baseSize} updatePattern={() => {}} />
          <Tieups cellStyle={cellStyle} warp={warp} weft={weft} tieups={tieups} updatePattern={() => {}} baseSize={baseSize} />
          <Drawdown warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} />
        </StyledPattern>
      </ElementPan>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onEditorUpdated: editor => dispatch(actions.objects.updateEditor(editor)),
  onEditObject: (id, field, value) => dispatch(actions.objects.update(id, field, value)),
});
const DraftPreviewContainer = connect(
  null, mapDispatchToProps,
)(DraftPreview);

export default DraftPreviewContainer;
