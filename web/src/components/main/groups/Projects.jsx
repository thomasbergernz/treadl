import React, { useState, useEffect } from 'react';
import { Input, Divider, Loader, Segment, Card, Dropdown, Button } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import actions from '../../../actions';
import api from '../../../api';

import ProjectCard from '../../includes/ProjectCard';

function Projects() {
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const { id } = useParams();

  const { group, myProjects, projectFilter } = useSelector(state => {
    let group;
    state.groups.groups.forEach((g) => {
      if (g._id === id) group = g;
    });
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    const myProjects = state.projects.projects.filter(p => p.user === user?._id);
    const projectFilter = state.groups.projectFilter;
    return { group, myProjects, projectFilter };
  });

  useEffect(() => {
    setLoadingProjects(true);
    api.groups.getProjects(group._id, projects => {
      setLoadingProjects(false);
      setProjects(projects);
    }, err => {
      toast.error(err.message);
      setLoadingProjects(false);
    });
  }, [group._id]);

  const toggleProjectVisible = (project) => {
    let groupVisibility = Object.assign([], project.groupVisibility);
    const index = groupVisibility.indexOf(group._id);
    if (index > -1) groupVisibility.splice(index, 1);
    else groupVisibility.push(group._id);
    api.projects.update(project.fullName, { groupVisibility }, updatedProject => {
      dispatch(actions.projects.receiveProject(updatedProject));
      const existingIndex = projects.map(p => p._id).indexOf(updatedProject._id);
      const newProjects = Object.assign([], projects);
      if (index > -1 && existingIndex > -1) newProjects.splice(existingIndex, 1);
      if (index === -1 && existingIndex === -1) newProjects.push(updatedProject);
      setProjects(newProjects);
    }, err => toast.error(err.message));
  }

  const AddProject = (props) => {
    return (
      <Dropdown icon={null} {...props}
        trigger={<Button size='small' icon='plus' color='teal' content='Add one of your own projects' style={{maxWidth: 'inherit'}} />}
      >
        <Dropdown.Menu direction={props.menuDirection || 'left'}>
          <Dropdown.Header>Choose projects to show in this group</Dropdown.Header>
          {myProjects.map(project =>
            <Dropdown.Item key={project._id} onClick={e => toggleProjectVisible(project)} content={project.name} icon={project.groupVisibility?.indexOf(group._id) > -1 ? 'check' : null} />
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  const filterExp = new RegExp(projectFilter, 'i');

  return (
    <div>
      {loadingProjects && !projects?.length && <Loader active inline="centered" />}
      {!loadingProjects && <>
        <h2>Projects in this group</h2>
        <p>This tab lists projects that members have made available to this group.</p>

        {myProjects?.length > 0 && <div style={{ display: 'flex', justifyContent: 'end' }}>
          <AddProject />
        </div>}
        
        <Divider />
        {projects?.length > 0 &&
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Input size='small' icon='search' value={projectFilter} onChange={e => dispatch(actions.groups.updateProjectFilter(e.target.value))} placeholder='Filter projects...' />
          </div>
        }

        {projects?.length > 0 ?
          <Card.Group itemsPerRow={3}>
            {projects && projects.filter(p => p.fullName.match(filterExp) || p.name.match(filterExp)).map(p =>
              <ProjectCard key={p._id} project={p} />
            )}
          </Card.Group>
        :
          <Segment placeholder textAlign='center'>
            <h3>No projects are available yet</h3>
            <p>Be the first to add a project to this page.</p>
            <AddProject menuDirection='right'/>
          </Segment>
        }
      </>}
    </div>
  )
}

export default Projects;
