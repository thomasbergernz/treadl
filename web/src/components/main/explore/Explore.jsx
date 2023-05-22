import React, { useState, useEffect } from 'react';
import { Container, Card, Grid, Button } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import actions from '../../../actions';
import api from '../../../api';
import utils from '../../../utils/utils.js';

import DiscoverCard from '../../includes/DiscoverCard';
import PatternCard from '../../includes/PatternCard';
import PatternLoader from '../../includes/PatternLoader';
import DraftPreview from '../projects/objects/DraftPreview';

export default function Explore() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  
  const { objects, page } = useSelector(state => {
    return { objects: state.objects.exploreObjects, page: state.objects.explorePage };
  });
  
  useEffect(() => {
    if (page < 2) loadMoreExplore();
  }, []);
  
  function loadMoreExplore() {
    setLoading(true);
    api.search.explore(page + 1, data => {
      dispatch(actions.objects.receiveExplore(data.objects));
      setLoading(false);
    });
  }
  
  return (
    <Container style={{ marginTop: '40px' }}>
      <Grid stackable>
        <Grid.Column computer={5} tablet={8}>
          <DiscoverCard count={7} />
        </Grid.Column>
        <Grid.Column computer={11} tablet={8}>
          <h1>Recent patterns on {utils.appName()}</h1>
          
          <Card.Group stackable doubling itemsPerRow={3} style={{marginTop: 30}}>
            {objects?.filter(o => o.projectObject && o.userObject).map(object =>
              <PatternCard object={object} project={object.projectObject} user={object.userObject} />
            )}
            {objects?.length === 0 && <>
              <PatternLoader count={6} />
            </>}
          </Card.Group>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
            <Button loading={loading} onClick={loadMoreExplore}>View more</Button>
          </div>
        </Grid.Column>
      </Grid>
    </Container>
  )
}