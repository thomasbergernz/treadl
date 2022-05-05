import React from 'react';
import { Grid } from 'semantic-ui-react';

import HelpLink from 'components/includes/HelpLink';

import ObjectList from './ObjectList';
import ObjectViewer from './ObjectViewer';

function ProjectObjects() {
  return (
    <>
      <Grid stackable>
        <Grid.Column width={4}>
          <ObjectList compact />
          <HelpLink link={`${process.env.REACT_APP_SUPPORT_ROOT}Projects#viewing-and-editing-objects`} marginTop />
        </Grid.Column>
        <Grid.Column width={12}>
          <ObjectViewer />
        </Grid.Column>
      </Grid>
    </>
  );
}

export default ProjectObjects;
