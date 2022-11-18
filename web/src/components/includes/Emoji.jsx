import React from 'react';

function Emoji({ e, label }) {
  return <span role='img' aria-label={label || 'Emoji'} className='emoji'>{e}</span>;
}

export default Emoji;