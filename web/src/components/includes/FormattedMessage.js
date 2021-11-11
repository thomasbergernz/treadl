import React from 'react';

function FormattedMessage({ content }) {
  const urlRegex = /(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi
  const newContent = content.replace(urlRegex, (match, p1) => {
    const prefix = match.indexOf('http') !== 0 ? 'http://': '';
    return `<a href="${prefix}${match}" target="_blank">${match}</a>`;
  });
  return (
    <div dangerouslySetInnerHTML={{__html: newContent}} />
  );
}

export default FormattedMessage;
