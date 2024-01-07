import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from 'semantic-ui-react';
import actions from '../../../../actions';
import api from '../../../../api';
import util from '../../../../utils/utils.js';

import ElementPan from '../../../includes/ElementPan';
import { StyledPattern } from '../../../main/projects/objects/Draft';
import Warp from './Warp';
import Weft from './Weft';
import Tieups from './Tieups';
import Drawdown from './Drawdown';

function DraftPreview({ object }) {
  const [loading, setLoading] = useState(false);
  const [pattern, setPattern] = useState();
  const dispatch = useDispatch();
  const objectId = object?._id;

  useEffect(() => {
    dispatch(actions.objects.updateEditor({ tool: 'pan' }));
    setLoading(true);
    api.objects.get(objectId, (o) => {
      setLoading(false);
      if (o.pattern && o.pattern.warp) {
        setPattern(o.pattern);
        
        // Generate images
        setTimeout(() => {
          // Generate the preview if not yet set (e.g. if from uploaded WIF)
          if (!o.previewUrl) {
            util.generatePatternPreview(object, previewUrl => {
              dispatch(actions.objects.update(objectId, 'previewUrl', previewUrl));
            });
          }
          if (!o.fullPreviewUrl) {
            // Generate the entire pattern and store in memory
            util.generateCompletePattern(o.pattern, `.preview-${objectId}`, image => {
              dispatch(actions.objects.update(objectId, 'patternImage', image));
            });
          }
        }, 1000);
      }
    }, err => setLoading(false));
  }, [dispatch, objectId]);

  if (loading) return <Loader active />;
  if (!pattern) return null;
  const { warp, weft, tieups } = pattern;
  if (!warp || !weft || !tieups) return null;
  const baseSize = 6;
  const cellStyle = { width: `${baseSize || 10}px`, height: `${baseSize || 10}px` };
  return (
    <ElementPan
      startX={5000}
      startY={0}
    >
      <StyledPattern
        className={`pattern preview-${objectId}`}
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

export default DraftPreview;
