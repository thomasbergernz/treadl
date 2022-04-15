import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import api from 'api';
class FileChooser extends Component {
  constructor(props) {
    super(props);
    this.state = { isUploading: false };
  }

  startUpload = () => {
    this.setState({ isUploading: true });
    this.props.onUploadStart && this.props.onUploadStart();
  }

  finishUpload = () => {
    this.setState({ isUploading: false });
    this.props.onUploadFinish && this.props.onUploadFinish();
  }

  chooseFile = () => this.refs.fileInput.click()

  handleFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      this.startUpload();
      const fileName = file.name.replace(/[^a-zA-Z0-9_.]/g, '_');
      if (this.props.forType === 'project' && fileName.toLowerCase().indexOf('.wif') > -1) {
        const reader = new FileReader();
        reader.onload = (e2) => {
          this.finishUpload();
          this.props.onComplete({ wif: e2.target.result, type: 'pattern' });
        };
        reader.readAsText(file);
      } else {
        api.uploads.generateFileUploadRequest({
          forType: this.props.forType, forId: this.props.for._id, name: fileName, size: file.size, type: file.type,
        }, async (response) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', response.signedRequest);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              this.finishUpload();
              if (xhr.status === 200) {
                // We pass back the original file name so it can be displayed nicely
                this.props.onComplete({ storedName: response.fileName, name: file.name, type: 'file' });
              } else if (this.props.onError) {
                this.finishUpload();
                this.props.onError('Unable to upload file');
              }
            }
          };
          xhr.send(file);
        }, (err) => {
          this.finishUpload();
          if (this.props.onError) this.props.onError(err.message || 'Unable to upload file');
        });
      }
    }
  }

  render() {
    const { content, trigger, accept } = this.props;
    return (
      <React.Fragment>
        <input type="file" style={{ display: 'none' }} ref="fileInput" onChange={this.handleFileChosen} accept={accept || '*'} />
        {trigger
          ? React.cloneElement(trigger, { loading: this.state.isUploading, onClick: this.chooseFile })
          : <Button size="small" color="blue" icon="file" fluid content={content || 'Choose a file'} loading={this.state.isUploading} onClick={this.chooseFile} />
        }
      </React.Fragment>
    );
  }
}

export default FileChooser;
