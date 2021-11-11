import React from 'react';
import { Grid } from 'semantic-ui-react';

import ObjectList from './ObjectList';
import ObjectViewer from './ObjectViewer';

function ProjectObjects({ user, project, fullProjectPath }) {
  return (
    <>
      <Grid stackable>
        <Grid.Column width={4}>
          <ObjectList compact />
        </Grid.Column>
        <Grid.Column width={12}>
          <ObjectViewer />
        </Grid.Column>
      </Grid>
    </>
  );
}

export default ProjectObjects;
