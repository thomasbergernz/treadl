import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Joyride from 'react-joyride';
import api from '../../api';
import actions from '../../actions';
import { LinkContainer as HelpLinkContainer } from 'components/includes/HelpLink';

import WarpImage from 'images/tour/warp.png';
import WeftImage from 'images/tour/weft.png';
import ColourImage from 'images/tour/colour.png';
import PanImage from 'images/tour/pan.png';
import PointImage from 'images/tour/point.png';
import TieupsImage from 'images/tour/tieups.png';
import ToolsImage from 'images/tour/tools.png';

const tours = {
    home: [{
      disableBeacon: true,
      disableOverlay: false,
      placement: 'center',
      target: 'body',
      title: 'Welcome to Treadl!',
      content: (<div>
        <p><strong>Thanks for signing-up 😀. We'd love to quickly show you around your homepage.</strong></p>
        <p>You can skip this tour if you just want to get on with things.</p>
       </div>)
    },
    {
      target: '.joyride-projects',
      title: 'Projects',
      content: (<div>
        <p><strong>Treadl contents (patterns, images, files, and more) are stored in projects</strong></p>
        <p>Your projects will appear in this area. You can think of them like folders on your computer.</p>
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
      title: 'Creating groups',
      content: (<div>
        <p><strong>You can create your own groups to build a community</strong></p>
        <p>People use groups for weaving classes, organisation, community groups, and more.</p>
       </div>)
    },
    {
      target: '.joyride-help',
      title: 'One last thing...',
      content: (<div>
        <p><strong>Help and support</strong></p>
        <p>These types of links point to places to get help and support, so please use them if you get stuck!</p>
       </div>)
    },
  ],

  pattern: [
    {
      disableBeacon: true,
      disableOverlay: false,
      placement: 'center',
      target: 'body',
      title: 'Welcome to the Treadl pattern editor!',
      content: (<div>
        <p><strong>The editor can look a bit daunting at first, and so we'd like to briefly show you how it works.</strong></p>
        <p>If you already know what you're doing, then feel free to skip this.</p>
       </div>)
    },
    {
      target: '.joyride-drawdown',
      placement: 'top',
      title: 'The drawdown',
      content: (<div>
        <p><strong>This is where your pattern is displayed. It updates in real-time.</strong></p>
        <p>You need to have threads in both your warp and weft, as well as tieups specified, in order for a pattern to show.</p>
       </div>)
    },
    {
      target: '.joyride-warp',
      title: 'The warp',
      content: (<div>
        <p><strong>Add threads to your warp by selecting a tool (from the sidebar) and clicking and dragging your mouse over this area.</strong></p>
        <p>Different tools produce different thread patterns.</p>
        <img width='100%' src={WarpImage} />
       </div>)
    },
    {
      target: '.joyride-warpColourway',
      title: 'The warp colourway',
      content: (<div>
        <p><strong>Add colours to your threads</strong></p>
        <p>Select the colour tool (from the sidebar) and drag over your warp to change the thread colours.</p>
        <img width='100%' src={ColourImage} />
       </div>)
    },
    {
      target: '.joyride-weft',
      placement: 'left',
      title: 'The weft',
      content: (<div>
        <p><strong>The weft works in the same way as the warp</strong></p>
        <p>Drag drawing tools and colour tools over this area to change the thread patterns and colours.</p>
        <img width='100%' src={WeftImage} />
       </div>)
    },
    {
      target: '.joyride-tieups',
      title: 'The tieups area',
      content: (<div>
        <p><strong>The tieups determine how your warp and weft threads will be linked</strong></p>
        <p>Select individual tieups by clicking the squares relevant to your pattern.</p>
        <img width='100%' src={TieupsImage} />
       </div>)
    },
    {
      target: '.joyride-threads',
      title: 'Shafts and treadles',
      content: (<div>
        <p><strong>You may need to update the shafts and treadles used by your pattern so that it can be used with your loom</strong></p>
        <p>Changing these values will update the available threads in your warp and weft.</p>
       </div>)
    },
    {
      target: '.joyride-pan',
      title: 'Panning tool',
      content: (<div>
        <p><strong>Select this and click-and-drag over your drawdown to move it around</strong></p>
        <img width='100%' src={PanImage} />
       </div>)
    },
    {
      target: '.joyride-colour',
      title: 'Colour tool',
      content: (<div>
        <p><strong>Select this tool and click-and-drag over your warp and weft to add colours to your threads</strong></p>
        <img width='100%' src={ColourImage} />
       </div>)
    },
    {
      target: '.joyride-straight',
      title: 'Straight draw tool',
      placement: 'left',
      content: (<div>
        <p><strong>Select this tool and click-and-drag over your warp and weft to add threads in a straight pattern</strong></p>
        <img width='100%' src={WarpImage} />
       </div>)
    },
    {
      target: '.joyride-point',
      title: 'Point draw tool',
      placement: 'left',
      content: (<div>
        <p><strong>Select this tool and click-and-drag over your warp and weft to add threads in a point pattern</strong></p>
        <img width='100%' src={PointImage} />
       </div>)
    },
    {
      target: '.joyride-tools',
      title: 'Rich tooling',
      placement: 'left',
      content: (<div>
        <p><strong>Expand the sections in the toolbox to see what else is possible</strong></p>
        <p>For example, you can change your pattern's zoom level and view different types of interlacements.</p>
        <img width='100%' src={ToolsImage} />
       </div>)
    },
    {
      target: '.joyride-help',
      title: 'Help is available',
      content: (<div>
        <p><strong>Click this link to view documentation about the editor</strong></p>
        <p>And you can always reach out to us directly if you're stuck or have questions.</p>
       </div>)
    },
  ],
};

function Tour({ id, run }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });

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

export function ReRunTour({ id }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });
  if (!user || user.finishedTours?.indexOf(id) === -1) return null;

  const reset = () => {
    const finishedTours = user.finishedTours;
    const index = finishedTours.indexOf(id);
    finishedTours.splice(index, 1);
    dispatch(actions.users.update(id, { finishedTours }));
  };

  return (
    <HelpLinkContainer marginLeft onClick={reset}><span className='emoji'>▶️</span>Re-play tour</HelpLinkContainer>
  );
}

export default Tour;