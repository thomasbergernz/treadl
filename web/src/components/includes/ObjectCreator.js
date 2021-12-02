import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, Dropdown } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import actions from 'actions';
import api from 'api';

import FileChooser from 'components/includes/FileChooser';

class ObjectCreator extends Component {
  constructor(props) {
    super(props);
    this.state = { isUploading: false };
  }

  createNewPattern = () => {
    api.projects.createObject(this.props.project.fullName, { name: 'Untitled pattern', type: 'pattern' }, (object) => {
      this.props.onCreateObject(object);
      this.props.history.push(`/${this.props.project.fullName}/${object._id}/edit`);
    }, err => this.setState({ loading: false }));
  }

  fileUploaded = (file) => {
    this.setState({ isUploading: true });
    api.projects.createObject(this.props.project.fullName, {
      name: file.name, storedName: file.storedName, type: file.type, wif: file.wif,
    }, (object) => {
      this.setState({ isUploading: false });
      this.props.onCreateObject(object);
      this.props.history.push(`/${this.props.project.fullName}/${object._id}`);
    }, (err) => {
      toast.error(err.message);
      this.setState({ isUploading: false });
      this.props.onError && this.props.onError(err);
    });
  }

  render() {
    const { project, fluid } = this.props;
    const { isUploading } = this.state;
    return (
      <Dropdown
        fluid={!!fluid}
        icon={null}
        trigger=<Button color="teal" fluid content="Add something" icon="plus" loading={isUploading} />
      >
        <Dropdown.Menu>
          <Dropdown.Item onClick={this.createNewPattern} icon="pencil" content="Create a new weaving pattern" />
          <FileChooser
            forType="project"
            for={project}
            trigger=<Dropdown.Item icon="upload" content="Import a WIF file" />
            accept=".wif"
            onUploadStart={e => this.setState({ isUploading: true })}
            onUploadFinish={e => this.setState({ isUploading: false })}
            onComplete={this.fileUploaded}
          />
          <FileChooser
            forType="project"
            for={project}
            trigger=<Dropdown.Item icon="cloud upload" content="Upload an image or a file" />
            onUploadStart={e => this.setState({ isUploading: true })}
            onUploadFinish={e => this.setState({ isUploading: false })}
            onComplete={this.fileUploaded}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
const mapDispatchToProps = dispatch => ({
  onCreateObject: name => dispatch(actions.objects.create(name)),
  onSelectObject: id => dispatch(actions.objects.select(id)),
});
const ObjectCreatorContainer = withRouter(connect(
  null, mapDispatchToProps,
)(ObjectCreator));

export default ObjectCreatorContainer;
