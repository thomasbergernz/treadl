import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from 'actions'; import api from 'api'; import Warp from './Warp.js'; import Weft from './Weft.js';
import Tieups from './Tieups.js';
import Drawdown from './Drawdown.js';

class DraftExport extends Component {
  constructor(props) {
    super(props);
    this.state = {  };
  }
  componentDidMount() {
    this.props.onEditorUpdated({ view: 'colour' }); // interlacement, warp, weft
    api.objects.get(this.props.match.params.id, (object) => {
      if (object.pattern && object.pattern.warp) this.setState(object);
    });
  }

  render() {
    if (!this.state.pattern) return null;
    const { warp, weft, tieups } = this.state.pattern;
    if (!warp || !weft || !tieups) return null;
    const baseSize = 6;
    const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
    return (
      <div className="pattern"
        style={{
          margin: '0px 0px',
          width: `${warp.threads * baseSize + weft.treadles * baseSize + 20}px`,
          height: `${warp.shafts * baseSize + weft.threads * baseSize + 20}px`,
          display: this.props.hidden ? 'none' : 'inherit',
        }}
      >

        <Drawdown warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} />
        <Warp baseSize={baseSize} cellStyle={cellStyle} warp={warp} weft={weft} updatePattern={() => {}} />
        <Weft cellStyle={cellStyle} warp={warp} weft={weft} baseSize={baseSize} updatePattern={() => {}} />
        <Tieups cellStyle={cellStyle} warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} updatePattern={() => {}} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onEditorUpdated: editor => dispatch(actions.objects.updateEditor(editor)),
  onEditObject: (id, field, value) => dispatch(actions.objects.update(id, field, value)),
});
const DraftExportContainer = connect(
  null, mapDispatchToProps,
)(DraftExport);

export default DraftExportContainer;
