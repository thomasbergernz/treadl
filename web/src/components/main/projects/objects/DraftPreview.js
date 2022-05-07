import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from 'semantic-ui-react';
import actions from 'actions';
import api from 'api';

import ElementPan from 'components/includes/ElementPan';
import { StyledPattern } from 'components/main/projects/objects/Draft';
import Warp from './Warp.js';
import Weft from './Weft.js';
import Tieups from './Tieups.js';
import Drawdown from './Drawdown.js';

function DraftPreview({ object, onImageLoaded }) {
  const [loading, setLoading] = useState(false);
  const [pattern, setPattern] = useState();
  const dispatch = useDispatch();
  const objectId = object?._id;

  const generatePreview = useCallback(() => {
    setTimeout(() => {
      const c = document.getElementsByClassName('drawdown')[0];
      const preview = c?.toDataURL();
      if (preview) {
        api.objects.update(objectId, { preview }, () => {
          dispatch(actions.objects.update(objectId, 'preview', preview));
        });
      }
    }, 1000);
  }, [dispatch]);

  useEffect(() => {
    dispatch(actions.objects.updateEditor({ tool: 'pan' }));
    setLoading(true);
    api.objects.get(objectId, (o) => {
      setLoading(false);
      if (o.pattern && o.pattern.warp) {
        setPattern(o.pattern);
        if (!o.preview) generatePreview();
      }
    }, err => setLoading(false));
  }, [objectId]);

  const unifyCanvas = useCallback(({ warp, weft }) => {
    setTimeout(() => {
      //const { warp, weft } = pattern;
      const baseSize = 6;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = warp.threads * baseSize + weft.treadles * baseSize + 20;
      canvas.height = warp.shafts * baseSize + weft.threads * baseSize + 20;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      const warpCanvas = document.querySelector(`.preview-${objectId} .warp-threads`);
      const warpColourwayCanvas = document.querySelector(`.preview-${objectId} .warp-colourway`);
      const weftCanvas = document.querySelector(`.preview-${objectId} .weft-threads`);
      const weftColourwayCanvas = document.querySelector(`.preview-${objectId} .weft-colourway`);
      const drawdownCanvas = document.querySelector(`.preview-${objectId} .drawdown`);
      const tieupsCanvas = document.querySelector(`.preview-${objectId} .tieups`);
      if (warpCanvas) {
        ctx.drawImage(warpColourwayCanvas, canvas.width - warpCanvas.width - weft.treadles * baseSize - 20, 0);
        ctx.drawImage(warpCanvas, canvas.width - warpCanvas.width - weft.treadles * baseSize - 20, 10);
        ctx.drawImage(weftCanvas, canvas.width - 10 - weft.treadles * baseSize, warp.shafts * baseSize + 20);
        ctx.drawImage(weftColourwayCanvas, canvas.width - 10, warp.shafts * baseSize + 20);
        ctx.drawImage(tieupsCanvas, canvas.width - weft.treadles * baseSize - 10, 10);
        ctx.drawImage(drawdownCanvas, canvas.width - drawdownCanvas.width - weft.treadles * baseSize - 20, warp.shafts * baseSize + 20);

        onImageLoaded(canvas.toDataURL());
      }
    }, 500);
  }, [objectId, onImageLoaded]);

  useEffect(() => {
    if (pattern && onImageLoaded) unifyCanvas(pattern);
  }, [pattern, onImageLoaded, unifyCanvas])

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
