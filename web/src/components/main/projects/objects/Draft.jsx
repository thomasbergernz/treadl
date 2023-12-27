import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import Tour from '../../../includes/Tour';
import ElementPan from '../../../includes/ElementPan';
import util from '../../../../utils/utils.js';

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
    util.generatePatternPreview(object, previewUrl => {
      dispatch(actions.objects.update(objectId, 'previewUrl', previewUrl));
    });
    const newObject = Object.assign({}, object);
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

  if (!pattern) return null;
  const { warp, weft, tieups, baseSize } = pattern;
  const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
  return (
    <div style={{position: 'relative'}}>
      <Helmet title={`${name || 'Weaving Draft'}`} />
      <Tour id='pattern' run={true} />
      <Tools warp={warp} weft={weft} object={object} pattern={pattern} updateObject={updateObject} updatePattern={updatePattern} saveObject={saveObject} baseSize={baseSize} unsaved={unsaved} saving={saving}/>
      
      <div style={{overflow: 'hidden', zIndex: 10}}>
        <ElementPan
          disabled={!(editor?.tool === 'pan')}
          startX={5000}
          startY={0}
        >
          <StyledPattern
            style={{
              width:  `${warp.threading?.length * baseSize + weft.treadles * baseSize + 20}px`,
              height: `${warp.shafts * baseSize + weft.treadling?.length * baseSize + 20}px`
            }}
          >
            <Warp baseSize={baseSize} cellStyle={cellStyle} warp={warp} weft={weft} updatePattern={updatePattern} />
            <Weft cellStyle={cellStyle} warp={warp} weft={weft} baseSize={baseSize} updatePattern={updatePattern} />
            <Tieups cellStyle={cellStyle} warp={warp} weft={weft} tieups={tieups} updatePattern={updatePattern} baseSize={baseSize}/>
            <Drawdown warp={warp} weft={weft} tieups={tieups} baseSize={baseSize} />

          </StyledPattern>
        </ElementPan>
      </div>
    </div>
  );
}

export default Draft;
