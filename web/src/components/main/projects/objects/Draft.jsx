import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import ElementPan from '../../../includes/ElementPan';
import HelpLink from '../../../includes/HelpLink';
import Tour, { ReRunTour } from '../../../includes/Tour';

import Warp from './Warp';
import Weft from './Weft';
import Tieups from './Tieups';
import Drawdown from './Drawdown';
import Tools from './Tools';

import api from '../../../../api';
import actions from '../../../../actions';

export const StyledPattern = styled.div`
  position:relative;
  min-width:100%;
  width:0px;
  height:0px;
  margin:20px;
`;

function Draft() {
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [object, setObject] = useState();
  const [pattern, setPattern] = useState();
  const [hasSelectedThreads, setHasSelectedThreads] = useState(false);
  const [name] = useState();
  const { objectId } = useParams();
  const dispatch = useDispatch();
  const { editor } = useSelector(state => ({ editor: state.objects.editor }));

  useEffect(() => {
    api.objects.get(objectId, (o) => {
      if (!o.pattern.baseSize) o.pattern.baseSize = 10;
      setObject(o);
      setPattern(o.pattern);
    });
  }, [objectId]);
  
  useEffect(() => {
    if (!pattern) return;
    const { warp } = pattern;
    let selectedFound = false;
    for (let i = 0; i < warp?.threading?.length; i++) {
      if (warp.threading[i].isSelected) {
        selectedFound = true;
        break;
      }
    }
    setHasSelectedThreads(selectedFound);
  }, [pattern]);

  const updateObject = (update) => {
    setObject(Object.assign({}, object, update));
    setUnsaved(true);
  };

  const updatePattern = (update) => {
    const newPattern = Object.assign({}, pattern, update);
    setPattern(Object.assign({}, pattern, newPattern));
    setUnsaved(true);
  };

  const saveObject = () => {
    setSaving(true);
    const canvas = document.getElementsByClassName('drawdown')[0];
    const newObject = Object.assign({}, object);
    newObject.preview = canvas.toDataURL();
    newObject.pattern = pattern;
    api.objects.update(objectId, newObject, (o) => {
      toast.success('Pattern saved');
      dispatch(actions.objects.receive(o));
      setUnsaved(false);
      setSaving(false);
    }, (err) => {
      toast.error(err.message);
      setSaving(false);
    });
  };
  
  const deleteSelectedThreads = () => {
    if (pattern?.warp?.threading) {
      const newWarp = Object.assign({}, pattern.warp);
      newWarp.threading = warp.threading.filter(t => !t.isSelected);
      updatePattern({ warp: newWarp });
    }
  }

  if (!pattern) return null;
  const { warp, weft, tieups, baseSize } = pattern;
  const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
  return (
    <div>
      <Helmet title={`${name || 'Weaving Draft'}`} />
      <Tour id='pattern' run={true} />
      <div style={{display: 'flex'}}>

        <div style={{flex: 1, overflow: 'hidden'}}>
          <ElementPan
            disabled={!(editor?.tool === 'pan')}
            startX={5000}
            startY={0}
          >
            <StyledPattern
              style={{
                width:  `${warp.threads * baseSize + weft.treadles * baseSize + 20}px`,
                height: '1000px', // `${warp.shafts * baseSize + weft.threads * baseSize + 20}px`
              }}
            >

              <Warp baseSize={baseSize} cellStyle={cellStyle} warp={warp} weft={weft} updatePattern={updatePattern} />
              <Weft cellStyle={cellStyle} warp={warp} weft={weft} baseSize={baseSize} updatePattern={updatePattern} />
              <Tieups cellStyle={cellStyle} warp={warp} weft={weft} tieups={tieups} updatePattern={updatePattern} baseSize={baseSize}/>
              <Drawdown warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} />

            </StyledPattern>
          </ElementPan>
        </div>

        <div style={{width: 300, marginLeft: 20}}>
          <HelpLink className='joyride-help' link={`/docs/patterns#using-the-pattern-editor`} marginBottom/>
          <ReRunTour id='pattern' />
          {hasSelectedThreads &&
            <Button onClick={deleteSelectedThreads}>Delete selected</Button>
          }
          <Tools warp={warp} weft={weft} object={object} pattern={pattern} updateObject={updateObject} updatePattern={updatePattern} saveObject={saveObject} baseSize={baseSize} unsaved={unsaved} saving={saving}/>
        </div>

      </div>
    </div>
  );
}

export default Draft;
