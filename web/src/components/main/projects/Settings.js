import React, { Component } from 'react';
import { Form, Input, Divider, Segment, Button, Icon } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);
    this.state = { name: props.project.name, visibility: props.project.visibility || 'public', openSource: props.project.openSource, groupVisibility: props.project.groupVisibility || [] };
  }
  
  changeVisibility = (event, r) => {
    this.setState({ visibility: r.checked ? 'private' : 'public' });
  }

  changeOpenSource = (event, c) => {
    this.setState({ openSource: c.checked });
  }

  saveName = () => {
    utils.confirm('Update name', 'Really update this project\'s name? If you\'ve shared this project\'s link with someone, they may no longer be able to find it.').then(() => {
      api.projects.update(this.props.fullProjectPath, { name: this.state.name }, (project) => {
        this.props.onReceiveProject(project);
        this.props.history.push(`/${project.owner.username}/${project.path}`);
      }, err => toast.error(err.message));
    }, () => {});
  }

  saveVisibility = () => {
    api.projects.update(this.props.project.fullName, { visibility: this.state.visibility, openSource: this.state.openSource, groupVisibility: this.state.groupVisibility }, (project) => {
      this.props.onReceiveProject(project);
      toast.info('Visibility saved');
    }, err => toast.error(err.message));
  }

  deleteProject = () => {
    utils.confirm('Delete project', 'Really delete this project? All files and patterns it contains will also be deleted. This action cannot be undone.').then(() => {
      api.projects.delete(this.props.fullProjectPath, () => {
        this.props.onDeleteProject(this.props.project._id);
        toast.info('🗑️ Project deleted');
        this.props.history.push('/');
        this.setState({ nameError: '' });
      }, err => toast.error(err.message));
    }, () => {});
  }

  render() {
    const { name, visibility, openSource } = this.state;
    const { groups } = this.props;
    return (
      <div>
        <h2>Project settings</h2>

        <Divider hidden section />

        <Segment>
          <h3>General settings</h3>

          <h4>Project name</h4>
          <p>Changing the name of your project will also change its URL. If you have previously shared a link to your project, then visitors may not be able to find it if the name is changed.</p>
          <Input
            type="text" value={name}
            action=<Button color="teal" content="Update" onClick={this.saveName} />
            onChange={e => this.setState({ name: e.target.value })}
          />
        </Segment>

        <Divider hidden />

        <Segment color="yellow">
          <h3>Project visibility</h3>
          <Form>
            <Form.Checkbox label='This is a private project' checked={visibility === 'private'} onChange={this.changeVisibility} />
            <p style={{color:'rgb(150,150,150)'}}><Icon name='info' /> Private projects are not searchable and can't be seen by others, unless you give them access.</p>
            <Form.Checkbox label='This project is "open-source"' checked={openSource} onChange={this.changeOpenSource} />
            <p style={{color:'rgb(150,150,150)'}}><Icon name='info' /> Open-source projects allow other people to download any pattern source files they contain in WIF format.</p>
            <Divider hidden />

            {groups?.length > 0 &&
              <>
                <h4>Make visible to your groups</h4>
                <p>You can make this project visible to groups you are a member of - even if it is a private project. The selected groups will also list this project on their Projects tabs.</p>

                <Form.Select multiple
                  label='Make this project always visible to members of these groups'
                  value={this.state.groupVisibility}
                  options={groups.map(g => ({ key: g._id, value: g._id, text: g.name }))}
                  onChange={(e, s) => this.setState({ groupVisibility: s.value })}
                />
              </>
            }
          </Form>
          <Divider hidden />

          <Button color="teal" content="Save visibility" onClick={this.saveVisibility} />
        </Segment>

        <Divider hidden section />

        <Segment color="red">
          <h3>Delete project</h3>
          <p>Immediately and irreversibly delete this project, along with all of its contents.</p>
          <Button icon="trash" content="Delete project" color="red" onClick={this.deleteProject} />
        </Segment>
      </div>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  const { username, projectPath } = ownProps.match.params;
  const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
  return { user, groups, project, fullProjectPath: `${username}/${projectPath}` };
};
const mapDispatchToProps = dispatch => ({
  onDeleteProject: id => dispatch(actions.projects.deleteProject(id)),
  onReceiveProject: project => dispatch(actions.projects.receiveProject(project)),
  onUpdateProject: (id, update) => dispatch(actions.projects.updateProject(id, update)),
});
const ProjectSettingsContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(ProjectSettings));

export default ProjectSettingsContainer;
