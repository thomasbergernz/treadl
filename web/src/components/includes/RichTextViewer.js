import React from 'react';
import sanitizeHtml from 'sanitize-html';

function RichTextViewer({ content, style, className }) {
  if (!content) return null;
  return (
    <p
      style={Object.assign({}, { breakLines: 'pre-line'}, style)}
      className={className}
      dangerouslySetInnerHTML={{
        __html:
      sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'u']),
        allowedAttributes: {
          a: ['href', 'name', 'target'],
          img: ['src'],
        },
      }),
      }}
    />
  );
}

export default RichTextViewer;
