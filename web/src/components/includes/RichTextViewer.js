import React, { Component } from 'react';
import sanitizeHtml from 'sanitize-html';

class RichTextViewer extends Component {
  render() {
    if (!this.props.content) return null;
    return (
      <p
        style={Object.assign({}, { breakLines: 'pre-line'}, this.props.style)}
        className={this.props.className}
        dangerouslySetInnerHTML={{
          __html:
        sanitizeHtml(this.props.content, {
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
}

export default RichTextViewer;
