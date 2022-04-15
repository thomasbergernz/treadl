import React, { Component } from 'react';
import {
  Confirm, Select, Segment, Accordion, Grid, Icon, Input, Button,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Slider from 'rc-slider';
import styled from 'styled-components';

import 'rc-slider/assets/index.css';

import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

const ColourSquare = styled.div`
  background-color: ${props => props.colour};
  display:inline-block;
  position:relative;
  box-shadow:0px 0px 3px rgba(0,0,0,0.1);
  border-radius:2px;
  width:15px;
  height:15px;
  margin:2px;
  cursor:pointer;
  top:0px;
  transition:top 0.1s;
  &:hover{
    top:-3px;
  }
  &.colour.header-colour{
    margin-left:10px;
    top:4px;
  }
`;

class Tools extends Component {
  state = { colours: [], activeDrawers: ['properties', 'drawing', 'palette'], view: 'interlacement' }

  enableTool = (tool) => {
    this.props.onEditorUpdated({ tool, colour: this.props.editor.colour });
  }

  setColour = (colour) => {
    this.props.onEditorUpdated({ tool: 'colour', colour });
  }

  setView = (view) => {
    this.props.onEditorUpdated({ view });
  }

  setName = (event) => {
    this.props.updateObject({ name: event.target.value });
  }

  setShafts = (event) => {
    const warp = { ...this.props.warp, shafts: parseInt(event.target.value, 10) || 1 };
    this.props.updatePattern({ warp });
  }

  setTreadles = (event) => {
    const weft = { ...this.props.weft, treadles: parseInt(event.target.value, 10) || 1 };
    this.props.updatePattern({ weft });
  }

  onZoomChange = zoom => this.props.updatePattern({ baseSize: zoom || 10 })

  drawerIsActive = drawer => this.state.activeDrawers.indexOf(drawer) > -1

  activateDrawer = (drawer) => {
    const index = this.state.activeDrawers.indexOf(drawer);
    const drawers = this.state.activeDrawers;
    if (index === -1) {
      drawers.push(drawer);
    } else {
      drawers.splice(index, 1);
    }
    this.setState({ activeDrawers: drawers });
  }

  deleteObject = () => {
    api.objects.delete(this.props.match.params.objectId, () => {
      toast('🗑️ Pattern deleted');
      this.props.onObjectDeleted(this.props.match.params.objectId);
      this.props.history.push(`/${this.props.project.fullName}`);
    }, err => console.log(err));
  }

  render() {
    const { warp, weft, editor, unsaved, saving } = this.props;
    return (
      <div className="pattern-toolbox">
        {unsaved &&
          <Segment attached="top">
            <Button fluid color="teal" icon="save" content="Save pattern" onClick={() => this.props.saveObject(this.refs.canvas)} loading={saving}/>
          </Segment>
        }
        <Segment attached>
          <Accordion fluid>
            <Accordion.Title active={this.drawerIsActive('view')} onClick={e => this.activateDrawer('view')}>
              <Icon name="dropdown" /> View
            </Accordion.Title>
            <Accordion.Content active={this.drawerIsActive('view')}>
              <small>Drawdown view</small>
              <Select
                size="tiny"
                fluid
                value={editor.view}
                onChange={(e, s) => this.setView(s.value)}
                style={{ fontSize: '11px' }}
                options={[
                  { key: 1, value: 'interlacement', text: 'Interlacement' },
                  { key: 2, value: 'colour', text: 'Colour only' },
                  { key: 3, value: 'warp', text: 'Warp view' },
                  { key: 4, value: 'weft', text: 'Weft view' },
                ]}
              />
              <div style={{ marginTop: '5px' }} />
              <small>Zoom</small>
              <Slider defaultValue={this.props.baseSize} min={5} max={13} step={1} onAfterChange={this.onZoomChange} />
            </Accordion.Content>

            <Accordion.Title active={this.drawerIsActive('properties')} onClick={e => this.activateDrawer('properties')}>
              <Icon name="dropdown" /> Properties
            </Accordion.Title>
            <Accordion.Content active={this.drawerIsActive('properties')}>
              <small>Name</small>
              <Input type="text" size="small" fluid style={{ marginBottom: '5px' }} value={this.props.object.name} onChange={this.setName} />
              <Grid columns={2}>
                <Grid.Row>
                  <Grid.Column>
                    <small>Shafts</small>
                    <Input fluid type="number" value={warp.shafts} onKeyDown={e => false} onChange={this.setShafts} size="mini" />
                  </Grid.Column>
                  <Grid.Column>
                    <small>Treadles</small>
                    <Input fluid type="number" value={weft.treadles} onKeyDown={e => false} onChange={this.setTreadles} size="mini" />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Accordion.Content>

            <Accordion.Title active={this.drawerIsActive('drawing')} onClick={e => this.activateDrawer('drawing')}>
              <Icon name="dropdown" /> Tools
            </Accordion.Title>
            <Accordion.Content active={this.drawerIsActive('drawing')}>
              <Button.Group fluid>
                <Button data-tooltip="Pan (drag to move) pattern" color={this.props.editor.tool === 'pan' && 'blue'} size="tiny" icon onClick={() => this.enableTool('pan')}><Icon name="move" /></Button>
                <Button data-tooltip="Paint selected colour" color={this.props.editor.tool === 'colour' && 'blue'} size="tiny" icon onClick={() => this.enableTool('colour')}><Icon name="paint brush" /></Button>
                <Button data-tooltip="Straight draw" color={this.props.editor.tool === 'straight' && 'blue'} size="tiny" icon onClick={() => this.enableTool('straight')}>/ /</Button>
                <Button data-tooltip="Point draw" color={this.props.editor.tool === 'point' && 'blue'} size="tiny" icon onClick={() => this.enableTool('point')}><Icon name="chevron up" /></Button>
              </Button.Group>
            </Accordion.Content>

            <Accordion.Title active={this.drawerIsActive('palette')} onClick={e => this.activateDrawer('palette')}>
              <Icon name="dropdown" /> Palette
              <ColourSquare colour={utils.rgb(this.props.editor.colour)} style={{top: 4, marginLeft: 10}}/>
            </Accordion.Title>
            <Accordion.Content active={this.drawerIsActive('palette')}>
              {this.props.pattern.colours && this.props.pattern.colours.map(colour =>
                <ColourSquare key={colour} colour={utils.rgb(colour)} onClick={() => this.setColour(colour)} />
              )}
            </Accordion.Content>

            <Accordion.Title active={this.drawerIsActive('advanced')} onClick={e => this.activateDrawer('advanced')}>
              <Icon name="dropdown" /> Advanced
            </Accordion.Title>
            <Accordion.Content active={this.drawerIsActive('advanced')}>
              <Button size="small" basic color="red" fluid onClick={e => this.setState({ deleteModalOpen: true })}>Delete pattern</Button>
              <Confirm
                open={this.state.deleteModalOpen}
                content="Really delete this pattern?"
                onCancel={e => this.setState({ deleteModalOpen: false })}
                onConfirm={this.deleteObject}
              />
            </Accordion.Content>
          </Accordion>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { username, projectPath } = ownProps.match.params;
  let project = {};
  state.projects.projects.forEach((p) => {
    if (p.path === projectPath && p.owner && p.owner.username === username) project = p;
  });
  return { project, fullName: `${username}/${projectPath}`, editor: state.objects.editor };
};
const mapDispatchToProps = dispatch => ({
  onEditorUpdated: editor => dispatch(actions.objects.updateEditor(editor)),
  onObjectDeleted: id => dispatch(actions.objects.delete(id)),
});
const ToolsContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(Tools));

export default ToolsContainer;
