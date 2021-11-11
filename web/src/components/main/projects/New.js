import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Icon, Form, Message, Grid, Input, Button, Divider } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import UserChip from 'components/includes/UserChip';

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'My new project', description: '', visibility: 'public', openSource: true, groupVisibility: [], error: '', loading: false,
    };
  }

  updateName = (event) => {
    this.setState({ name: event.target.value });
  }

  changeVisibility = (event, r) => {
    this.setState({ visibility: r.checked ? 'private' : 'public' });
  }

  changeOpenSource = (event, c) => {
    this.setState({ openSource: c.checked });
  }

  createProject = () => {
    this.setState({ loading: true });
    const { name, description, visibility, openSource, groupVisibility } = this.state;
    api.projects.create({ name, description, visibility, openSource, groupVisibility }, (project) => {
      this.props.onReceiveProject(project);
      this.setState({ loading: false });
      this.props.history.push(`/${this.props.user.username}/${project.path}`);
    }, (err) => {
      this.setState({ loading: false });
      toast.error(err.message);
    });
  }

  render() {
    const {
      name, description, visibility, openSource, groupVisibility
    } = this.state;
    const { user, groups } = this.props;
    return (
      <Grid stackable centered>
        <Helmet title={'Create Project'} />
        <Grid.Column computer={8}>
          <h2 style={{ marginTop: 40 }}>
            <Icon name="book" />
            {' '}
Create a new project
          </h2>
          <p>This will contain all of the files and patterns for your project.</p>
          <Divider section />

          <h3>About your project</h3>
          <p>Give your project a short name. You can always rename it later on.</p>
          <Input autoFocus type="text" fluid onChange={this.updateName} value={name} label={<UserChip user={user} style={{ marginRight: 10, marginTop: 4 }} />} />
          <Divider hidden />
          <p>Write a project description (optional).</p>
          <Form><Form.TextArea placeholder="Project description (optional)..." value={description} onChange={e => this.setState({ description: e.target.value })} /></Form>
          <Divider section />

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
                  value={groupVisibility}
                  options={groups.map(g => ({ key: g._id, value: g._id, text: g.name }))}
                  onChange={(e, s) => this.setState({ groupVisibility: s.value })}
                />
              </>
            }
          </Form>

          <Divider section />

          {this.state.error && <Message color="orange" content={this.state.error} />}
          <div style={{textAlign:'right'}}>
            <Button basic onClick={this.props.history.goBack}>Cancel</Button>
            <Button color="teal" icon="check" content="Create project" onClick={this.createProject} loading={this.state.loading} />
          </div>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => { 
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
  return { user, groups };
};
const mapDispatchToProps = dispatch => ({
  onReceiveProject: project => dispatch(actions.projects.receiveProject(project)),
});
const NewProjectContainer = withRouter(connect(
  mapStateToProps, mapDispatchToProps,
)(NewProject));

export default NewProjectContainer;
