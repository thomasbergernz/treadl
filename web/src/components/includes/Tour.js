import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Joyride from 'react-joyride';
import api from '../../api';
import actions from '../../actions';

const tours = {
  home: [{
    disableBeacon: true,
    placement: 'center',
    target: 'body',
    title: 'Welcome to Treadl!',
    content: (<div>
      <p><strong>Thanks for signing-up 😀. We'd love to quickly show you around your homepage.</strong></p>
      <p>You can skip this tour if you just want to get on.</p>
     </div>)
  },
  {
    target: '.joyride-projects',
    title: 'Projects',
    content: (<div>
      <p><strong>Treadl contents (patterns, images, files, and more) are stored in projects</strong></p>
      <p>Your projects will appear in this area.</p>
     </div>)
  },
  {
    target: '.joyride-createProject',
    title: 'Create a new project',
    content: (<div>
      <p>Use this button to create a new project. Projects can be public to the community or kept private.</p>
     </div>)
  },
  {
    target: '.joyride-groups',
    title: 'Groups',
    content: (<div>
      <p><strong>Treadl groups</strong></p>
      <p>Your group memberships will show here. Groups allow you to talk and share content with other people on Treadl.</p>
     </div>)
  },
  {
    target: '.joyride-createGroup',
    title: 'Groups',
    content: (<div>
      <p><strong>You can create your own groups to build a community</strong></p>
      <p>People use groups for weaving classes, organisation, community groups, and more.</p>
     </div>)
  },],
};

function Tour({ user, id, run }) {
  const dispatch = useDispatch();

  if (!user || user.finishedTours?.indexOf(id) > -1) return null;

  const cb = event => {
    if (event.type === 'tour:end') {
      const status = event.status == 'skipped' ? 'skipped' : 'completed';
      api.users.finishTour(user.username, id, status);
      const finishedTours = user.finishedTours;
      finishedTours.push(id);
      dispatch(actions.users.update(id, { finishedTours }));
    }
  };

  return (
    <Joyride steps={tours[id]} run={run} continuous={true} scrollToFirstStep={true} showSkipButton={true} disableCloseOnEsc={true} locale={{last: 'Finish'}}
      styles={{
        options: {
          primaryColor: '#ed0176'
        }
      }}
      callback={cb}
    />
  );
}

export default Tour;