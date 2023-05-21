import React, { useState, useEffect } from 'react';
import { Container, Card, Grid, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import actions from '../../../actions';
import api from '../../../api';
import utils from '../../../utils/utils.js';

import UserChip from '../../includes/UserChip';
import DiscoverCard from '../../includes/DiscoverCard';
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
              <Card raised key={object._id} style={{ cursor: 'pointer' }} as={Link} to={`/${object.userObject?.username}/${object.projectObject?.path}/${object._id}`}>
                <div style={{ height: 200, backgroundImage: `url(${object.preview})`, backgroundSize: 'cover', backgroundPosition: 'top right', position: 'relative' }}>
                  {object.userObject && 
                    <div style={{position: 'absolute', top: 5, left: 5, padding: 3, background: 'rgba(250,250,250,0.5)', borderRadius: 5}}>
                      <UserChip user={object.userObject} />
                    </div>
                  }
                </div>
                <Card.Content>
                  <p style={{ wordBreak: 'break-all' }}>{object.name}</p>
                  {object.projectObject?.path &&
                    <p style={{fontSize: 11, color: 'black'}}>{object.projectObject.path}</p>
                  }
                </Card.Content>
              </Card>
            )}
          </Card.Group>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
            <Button loading={loading} onClick={loadMoreExplore}>Load more</Button>
          </div>
        </Grid.Column>
      </Grid>
    </Container>
  )
}