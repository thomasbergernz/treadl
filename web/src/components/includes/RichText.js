import React, { Component } from 'react';
import pell from 'pell';

class RichText extends Component {
  ensureHTTP(url) {
    if (url.trim().toLowerCase().indexOf('http') !== 0) return `http://${url}`;
    return url;
  }

  componentDidMount() {
    pell.init({
      element: this.refs.textbox,
      onChange: this.props.onChange,
      actions: [
        {
          icon: '<i class="italic icon"></i>',
          name: 'italic',
          title: 'Italicise selected text',
          result: () => pell.exec('italic'),
        },
        {
          icon: '<i class="bold icon"></i>',
          name: 'bold',
          title: 'Bolden selected text',
          result: () => pell.exec('bold'),
        },
        {
          icon: '<i class="underline icon"></i>',
          name: 'underline',
          title: 'Underline selected text',
          result: () => pell.exec('underline'),
        },
        {
          icon: '<i class="align left icon"></i>',
          name: 'Align left',
          title: 'Align selected text left',
          result: () => pell.exec('justifyLeft'),
        },
        {
          icon: '<i class="align center icon"></i>',
          name: 'Align centre',
          title: 'Align selected text centrally',
          result: () => pell.exec('justifyCenter'),
        },
        {
          icon: '<i class="align right icon"></i>',
          name: 'Align right',
          title: 'Align selected text right',
          result: () => pell.exec('justifyRight'),
        },
        {
          icon: '<i class="image icon"></i>',
          name: 'image',
          title: 'Insert an image using a direct URL link',
          result: () => {
            const url = window.prompt('Enter the image URL'); // eslint-disable-line no-alert
            if (url) pell.exec('insertImage', this.ensureHTTP(url));
          },
        },
        {
          icon: '<i class="chain icon"></i>',
          name: 'link',
          title: 'Add hyperlink to selected text',
          result: () => {
            const url = window.prompt('Enter the link URL'); // eslint-disable-line no-alert
            if (url) pell.exec('createLink', this.ensureHTTP(url));
          },
        },
      ],
      defaultParagraphSeparator: 'p',
    }).content.innerHTML = this.props.value || '';
  }

  render() {
    return <div ref="textbox" />;
  }
}

export default RichText;
