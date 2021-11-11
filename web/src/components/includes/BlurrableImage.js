import React, { useState, useEffect, useRef } from 'react';
import { decode } from "blurhash";

function BlurrableImage({ src, blurHash, width, height, style }) {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef();

  useEffect(() => {
    if (blurHash) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(width || 600, height || 300);
      const pixels = decode(blurHash, height || 300, width || 600);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    }
  }, [blurHash, width, height]);

  return (
    <>
      <img src={src} onLoad={e => setLoaded(true)} style={{display:'none'}} alt='Loader' />
      {loaded && <div style={{...style, display: 'inline-block', width, height, backgroundImage: `url(${src})`, backgroundSize: 'cover'}}/>}
      {blurHash &&
        <canvas width={width || 600} height={height || 300} ref={canvasRef} style={{...style, display: !loaded ? 'inline-block' : 'none'}}/>
      }
    </>
  );
}

export default BlurrableImage;
