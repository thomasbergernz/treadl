import React, { useState, useEffect } from 'react';
import {
  Confirm, Header, Select, Segment, Accordion, Grid, Icon, Input, Button, Popup, Checkbox, Dropdown
} from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SketchPicker } from 'react-color';
import Slider from 'rc-slider';
import styled from 'styled-components';
import HelpLink from '../../../includes/HelpLink';
import Tour, { ReRunTour } from '../../../includes/Tour';

import 'rc-slider/assets/index.css';

import utils from '../../../../utils/utils.js';
import actions from '../../../../actions';
import api from '../../../../api';

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

function Tools({ object, pattern, warp, weft, unsaved, saving, baseSize, updatePattern, updateObject, saveObject }) {
  const [activeDrawers, setActiveDrawers] = useState(['properties', 'drawing', 'palette']);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newColour, setNewColour] = useState('#22194D');
  const [selectedThreadCount, setSelectedThreadCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { objectId, username, projectPath } = useParams();
  const { colours } = pattern;

  const { project, editor } = useSelector(state => {
    let project = {};
    state.projects.projects.forEach((p) => {
      if (p.path === projectPath && p.owner && p.owner.username === username) project = p;
    });
    return { project, editor: state.objects.editor };
  });

  useEffect(() => {
    if (!pattern) return;
    const { warp, weft } = pattern;
    let selected = 0;
    selected += warp?.threading?.filter(t => t.isSelected)?.length;
    selected += weft?.treadling?.filter(t => t.isSelected)?.length;
    setSelectedThreadCount(selected);
  }, [pattern]);
  
  useEffect(() => {
    if (colours?.length && !editor.colour) setColour(colours[colours.length - 1]);
  }, [colours]);

  const enableTool = (tool) => {
    dispatch(actions.objects.updateEditor({ tool, colour: editor.colour }));
  };

  const setColour = (colour) => {
    dispatch(actions.objects.updateEditor({ tool: 'colour', colour }));
  };

  const setEditorView = (view) => {
    dispatch(actions.objects.updateEditor({ view }));
  };

  const setName = (event) => {
    updateObject({ name: event.target.value });
  };

  const setShafts = (event) => {
    updatePattern({ warp: { ...warp, shafts: parseInt(event.target.value, 10) || 1 } });
  };

  const setTreadles = (event) => {
    updatePattern({ weft: { ...weft, treadles: parseInt(event.target.value, 10) || 1 } });
  };
  
  const setAutomaticallyExtend = (event, data) => {
    dispatch(actions.objects.updateEditor({ autoExtend: data.checked }))
  };

  const deleteSelectedThreads = () => {
    const sure = window.confirm('Really delete the selected threads?');
    if (!sure) return;
    const newWarp = Object.assign({}, pattern.warp);
    const newWeft = Object.assign({}, pattern.weft);
    if (pattern?.warp?.threading) {
      newWarp.threading = newWarp.threading.filter(t => !t.isSelected);
    }
    if (pattern?.weft?.treadling) {
      newWeft.treadling = newWeft.treadling.filter(t => !t.isSelected);
    }
    updatePattern({ warp: newWarp, weft: newWeft });
  }
  const deselectThreads = () => {
    const newWarp = Object.assign({}, pattern.warp);
    const newWeft = Object.assign({}, pattern.weft);
    newWarp.threading = newWarp?.threading?.map(t => ({ ...t, isSelected: undefined }));
    newWeft.treadling = newWeft?.treadling?.map(t => ({ ...t, isSelected: undefined }));
    updatePattern({ warp: newWarp, weft: newWeft });
  }

  const onZoomChange = zoom => updatePattern({ baseSize: zoom || 10 });

  const drawerIsActive = drawer => activeDrawers.indexOf(drawer) > -1;

  const activateDrawer = (drawer) => {
    const index = activeDrawers.indexOf(drawer);
    const drawers = activeDrawers;
    if (index === -1) drawers.push(drawer);
    else drawers.splice(index, 1);
    setActiveDrawers(Object.assign([], drawers));
  };

  const deleteObject = () => {
    api.objects.delete(objectId, () => {
      toast('🗑️ Pattern deleted');
      dispatch(actions.objects.delete(objectId));
      navigate(`/${project.fullName}`);
    }, err => console.log(err));
  }

  const revertChanges = () => {
    const sure = window.confirm('Really revert your changes to your last save point?\n\nAny updates to your pattern since you last saved will be lost.')
    if (sure) {
      window.location.reload();
    }
  };

  const changeWidth = () => {
    const newWidth = parseInt(window.prompt('Enter a new width for your pattern.\n\nIMPORTANT: If your new width is less than the current width, then any shafts selected beyond the new width will be lost.'));
    if (!newWidth) return;
    if (newWidth > warp.threading.length) {
      let i = warp.threading.length;
      while (i < newWidth) {
        warp.threading.push({ shaft: 0 });
        warp.threads++;
        i++;
      }
    }
    else if (newWidth < warp.threading.length) {
      warp.threading.splice(newWidth);
      warp.threads = warp.threading.length;
    }
    updatePattern({ warp });
    dispatch(actions.objects.updateEditor());
    dispatch(actions.objects.updateEditor( { tool: 'pan' }));
  };
  const changeHeight = () => {
    const newHeight = parseInt(window.prompt('Enter a new height for your pattern.\n\nIMPORTANT: If your new height is less than the current height, then any treadles selected beyond the new height will be lost.'));
    if (!newHeight) return;
    if (newHeight > weft.treadling.length) {
      let i = weft.treadling.length;
      while (i < newHeight) {
        weft.treadling.push({ treadle: 0 });
        weft.threads++;
        i++;
      }
    }
    else if (newHeight < weft.treadling.length) {
      weft.treadling.splice(newHeight);
      weft.threads = weft.treadling.length;
    }
    updatePattern({ weft });
    dispatch(actions.objects.updateEditor());
  };

  return (
    <div className="joyride-tools" style={{position: 'sticky', top: 10, zIndex: 20}}>
      <Segment>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          {selectedThreadCount > 0 ?
            <div>
              <Header>{selectedThreadCount} threads selected</Header>
              <Button size='small' basic onClick={deselectThreads}>De-select all</Button>
              <Button size='small' color='orange' onClick={deleteSelectedThreads}>Delete threads</Button>
            </div>
          :
            <div style={{display: 'flex', alignItems: 'end'}}>
              <div>
                <div><small>View</small></div>
                <Select size="tiny" value={editor.view}
                  onChange={(e, s) => setEditorView(s.value)}
                  style={{ fontSize: '11px', width: 70 }}
                  options={[
                    { key: 1, value: 'interlacement', text: 'Interlacement' },
                    { key: 2, value: 'colour', text: 'Colour only' },
                    { key: 3, value: 'warp', text: 'Warp view' },
                    { key: 4, value: 'weft', text: 'Weft view' },
                  ]}
                />
                
                <Popup hoverable
                  trigger={<Button style={{marginLeft: 5}} size="tiny" icon="zoom" />}
                  content={<div style={{width: 150}}>
                    <Slider defaultValue={baseSize} min={5} max={13} step={1} onAfterChange={onZoomChange} /> 
                  </div>}
                />
              </div>
              
              <div style={{marginLeft: 5}}>
                <div><small>Tools & drawing</small></div>
                <Button.Group size="tiny">
                  <Button className='joyride-pan' data-tooltip="Pan (drag to move) pattern" color={editor.tool === 'pan' && 'blue'} size="tiny" icon onClick={() => enableTool('pan')}><Icon name="move" /></Button>
                  <Button data-tooltip="Select threads" color={editor.tool === 'select' && 'blue'} size="tiny" icon onClick={() => enableTool('select')}><Icon name="i cursor" /></Button>
                  <Button data-tooltip="Insert threads" color={editor.tool === 'insert' && 'blue'} size="tiny" icon onClick={() => enableTool('insert')}><Icon name="plus" /></Button>
                  <Button className='joyride-colour' data-tooltip="Apply thread colour" color={editor.tool === 'colour' && 'blue'} size="tiny" icon onClick={() => enableTool('colour')}><Icon name="paint brush" /></Button>
                  <Button className='joyride-straight' data-tooltip="Straight draw" color={editor.tool === 'straight' && 'blue'} size="tiny" icon onClick={() => enableTool('straight')}>/ /</Button>
                  <Button className='joyride-point' data-tooltip="Point draw" color={editor.tool === 'point' && 'blue'} size="tiny" icon onClick={() => enableTool('point')}><Icon name="chevron up" /></Button>
                </Button.Group>
              </div>
              
              <div style={{marginLeft: 5}}>
                <div>
                  <small>Colour</small>
                  <ColourSquare colour={utils.rgb(editor.colour)} style={{top: 4, marginLeft: 10}} />
                </div>
                <Button.Group size="tiny">
                  <Popup hoverable on="click"
                    trigger={<Button style={{marginLeft: 5}} size="tiny" icon="tint" style={{color: utils.rgb(editor.colour)}} />}
                    content={<div style={{width: 150}}>
                      {pattern.colours && pattern.colours.map(colour =>
                        <ColourSquare key={colour} colour={utils.rgb(colour)} onClick={() => setColour(colour)} />
                      )}
                    </div>}
                  />
                  <Popup hoverable on='click'
                    trigger={<Button size='mini' icon='add' />}
                    content={
                      <div style={{padding: 3}}>
                        <SketchPicker color={newColour} onChangeComplete={c => setNewColour(c.rgb)} />
                        <Button size='sm' style={{marginTop: 10}} onClick={e => {
                          const { r, g, b } = newColour;
                          const newColours = Object.assign([], pattern.colours);
                          newColours.push(`${r},${g},${b}`);
                          updatePattern({ colours: newColours })
                        }}>Add colour to palette</Button>
                      </div>
                    }
                  />
                </Button.Group>
              </div>
            </div>
          }
          
          <div>
            <div>
              <Popup hoverable on='click' position='top right'
                trigger={<Button style={{marginLeft: 5}} size='tiny' content='Properties' />}
                content={
                  <div style={{padding: 3, width: 300}}>
                    <small>Name</small>
                    <Input type="text" size="small" fluid style={{ marginBottom: '5px' }} value={object.name} onChange={setName} />
                    <Grid columns={2}>
                      <Grid.Row className='joyride-threads'>
                        <Grid.Column>
                          <small>Shafts</small>
                          <Input fluid type="number" value={warp.shafts} onKeyDown={e => false} onChange={setShafts} size="mini" />
                        </Grid.Column>
                        <Grid.Column>
                          <small>Treadles</small>
                          <Input fluid type="number" value={weft.treadles} onKeyDown={e => false} onChange={setTreadles} size="mini" />
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row style={{paddingTop: 0}}>
                        <Grid.Column>
                          <small>Width (warp threads)</small>
                          <Input fluid readOnly value={warp.threading?.length || 0} size="mini"
                            action={{icon: 'edit', onClick: changeWidth}}
                          />
                        </Grid.Column>
                        <Grid.Column>
                          <small>Height (weft threads)</small>
                          <Input fluid readOnly value={weft.treadling?.length  || 0} size="mini"
                            action={{icon: 'edit', onClick: changeHeight}}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Popup
                      content='Add new threads to the warp and weft as you edit near the end'
                      trigger={<Checkbox checked={editor.autoExtend ?? true} onChange={setAutomaticallyExtend} label='Auto-extend warp and weft' style={{marginTop: 10}} />}
                    />
                  </div>
                }
              />
              
              <Dropdown icon={null} direction='left'
                trigger={<Button size='tiny' icon='cog' style={{marginLeft: 5}} />}
              >
                <Dropdown.Menu>
                  <Dropdown.Item text="Delete pattern" onClick={e => setDeleteModalOpen(true)} />
                </Dropdown.Menu>
              </Dropdown>
              <Confirm
                open={deleteModalOpen}
                content="Really delete this pattern?"
                onCancel={e => setDeleteModalOpen(false)}
                onConfirm={deleteObject}
              />
              
              <Dropdown style={{marginLeft: 5}} icon={null} direction='left'
                trigger={<Button size='tiny' icon='help' />}
              >
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/docs/patterns#using-the-pattern-editor`}target="_blank">Documentation</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div style={{marginTop: 5, textAlign: 'right'}}>
              <Button.Group size="tiny">
                <Button size="tiny" color="teal" icon="save" content="Save" onClick={() => saveObject()} loading={saving} disabled={!unsaved} />
                <Button size="tiny" icon='refresh' content='Revert' onClick={revertChanges} disabled={!unsaved} />
              </Button.Group>
            </div>
          </div>
        </div>
      </Segment>
    </div>
  );
}

export default Tools;
