import React, { useState } from 'react';
import { Form, Input, Divider, Segment, Button, Icon } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import utils from 'utils/utils.js';
import actions from 'actions';
import api from 'api';

import HelpLink from 'components/includes/HelpLink';

function ProjectSettings() {
  const { groups, project, fullProjectPath } = useSelector(state => {
    const project = state.projects.projects.filter(p => p.path === projectPath && p.owner && p.owner.username === username)[0];
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const groups = state.groups.groups.filter(g => utils.isInGroup(user, g._id));
    return { groups, project, fullProjectPath: `${username}/${projectPath}` };
  });

  const [name, setName] = useState(project.name);
  const [visibility, setVisibility] = useState(project.visibility || 'public');
  const [groupVisibility, setGroupVisibility] = useState(project.groupVisibility || []);
  const [openSource, setOpenSource] = useState(project.openSource || true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username, projectPath } = useParams();

  const changeVisibility = (event, r) => {
    setVisibility(r.checked ? 'private' : 'public');
  };

  const changeOpenSource = (event, c) => {
    setOpenSource(c.checked);
  };

  const saveName = () => {
    utils.confirm('Update name', 'Really update this project\'s name? If you\'ve shared this project\'s link with someone, they may no longer be able to find it.').then(() => {
      api.projects.update(fullProjectPath, { name: name }, (project) => {
        dispatch(actions.projects.receiveProject(project));
        navigate(`/${project.owner.username}/${project.path}`);
      }, err => toast.error(err.message));
    });
  };

  const saveVisibility = () => {
    api.projects.update(project.fullName, { visibility, openSource, groupVisibility }, (p) => {
      dispatch(actions.projects.receiveProject(p));
      toast.info('Visibility saved');
    }, err => toast.error(err.message));
  };

  const deleteProject = () => {
    utils.confirm('Delete project', 'Really delete this project? All files and patterns it contains will also be deleted. This action cannot be undone.').then(() => {
      api.projects.delete(fullProjectPath, () => {
        dispatch(actions.projects.deleteProject(project._id));
        toast.info('🗑️ Project deleted');
        navigate('/');
      }, err => toast.error(err.message));
    });
  }

  return (
    <div>
      <h2>Project settings</h2>

      <HelpLink link={`${process.env.REACT_APP_SUPPORT_ROOT}Projects#changing-the-project-s-settings`} />

      <Divider hidden section />

      <Segment>
        <h3>General settings</h3>

        <h4>Project name</h4>
        <p>Changing the name of your project will also change its URL. If you have previously shared a link to your project, then visitors may not be able to find it if the name is changed.</p>
        <Input
          type="text" value={name}
          action=<Button color="teal" content="Update" onClick={saveName} />
          onChange={e => setName(e.target.value)}
        />
      </Segment>

      <Divider hidden />

      <Segment color="yellow">
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
        <Divider hidden />

        <Button color="teal" content="Save visibility" onClick={saveVisibility} />
      </Segment>

      <Divider hidden section />

      <Segment color="red">
        <h3>Delete project</h3>
        <p>Immediately and irreversibly delete this project, along with all of its contents.</p>
        <Button icon="trash" content="Delete project" color="red" onClick={deleteProject} />
      </Segment>
    </div>
  );
}

export default ProjectSettings;
