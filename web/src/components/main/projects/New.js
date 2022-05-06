import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Icon, Form, Message, Grid, Input, Button, Divider } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import UserChip from 'components/includes/UserChip';
import HelpLink from 'components/includes/HelpLink';

function NewProject() {
  const [name, setName] = useState('My new project');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [openSource, setOpenSource] = useState(true);
  const [groupVisibility, setGroupVisibility] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, groups } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    return { user, groups };
  });

  const updateName = (event) => {
   setName(event.target.value);
  };

  const changeVisibility = (event, r) => {
    setVisibility(r.checked ? 'private' : 'public');
  };

  const changeOpenSource = (event, c) => {
    setOpenSource(c.checked);
  };

  const createProject = () => {
    setLoading(true);
    api.projects.create({ name, description, visibility, openSource, groupVisibility }, (project) => {
      dispatch(actions.projects.receiveProject(project));
      setLoading(false);
      navigate(`/${user.username}/${project.path}`);
    }, (err) => {
      setLoading(false);
      toast.error(err.message);
      setError(err.message);
    });
  };

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

        <HelpLink link={`${process.env.REACT_APP_SUPPORT_ROOT}Projects#creating-a-new-project`} />

        <Divider section />

        <h3>About your project</h3>
        <p>Give your project a short name. You can always rename it later on.</p>
        <Input autoFocus type="text" fluid onChange={updateName} value={name} label={<UserChip user={user} style={{ marginRight: 10, marginTop: 4 }} />} />
        <Divider hidden />
        <p>Write a project description (optional).</p>
        <Form><Form.TextArea placeholder="Project description (optional)..." value={description} onChange={e => setDescription(e.target.value)} /></Form>
        <Divider section />

        <h3>Project visibility</h3>
        <Form>
          <Form.Checkbox label='This is a private project' checked={visibility === 'private'} onChange={changeVisibility} />
          <p style={{color:'rgb(150,150,150)'}}><Icon name='info' /> Private projects are not searchable and can't be seen by others, unless you give them access.</p>
          <Form.Checkbox label='This project is "open-source"' checked={openSource} onChange={changeOpenSource} />
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
                onChange={(e, s) => setGroupVisibility(s.value)}
              />
            </>
          }
        </Form>

        <Divider section />

        {error && <Message color="orange" content={error} />}
        <div style={{textAlign:'right'}}>
          <Button basic onClick={() => navigate(-1)}>Cancel</Button>
          <Button color="teal" icon="check" content="Create project" onClick={createProject} loading={loading} />
        </div>
      </Grid.Column>
    </Grid>
  );
}
export default NewProject;
