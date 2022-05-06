import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, Icon, List, Container, Card, Grid, Message } from 'semantic-ui-react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import utils from 'utils/utils';
import actions from 'actions';
import api from 'api';

import BlurrableImage from 'components/includes/BlurrableImage';

function Profile() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { username } = useParams();

  const { user, profileUser, errorMessage } = useSelector(state => {
    const users = state.users.users;
    const profileUser = users.filter(u => username === u.username)[0];
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user, profileUser, errorMessage: state.users.errorMessage };
  });

  useEffect(() => {
    setLoading(true);
    api.users.get(username, user => {
      dispatch(actions.users.receive(user));
      setLoading(false);
    }, err => {
      dispatch(actions.users.requestFailed(err));
      setLoading(false);
    });
  }, [dispatch, username])

  return (
    <Container style={{ marginTop: '40px' }}>
      <Helmet title={profileUser?.username ? `${profileUser.username}'s Profile` : 'Profile'} />
      {loading && !profileUser &&
        <div style={{textAlign: 'center'}}>
          <h4>Loading {username}'s profile...</h4>
          <Loader active inline="centered" />
        </div>
      }
      {errorMessage && (
      <Message>
        <p><strong>There was a problem finding this page.</strong></p>
        <p>{errorMessage}</p>
      </Message>
      )}
      {profileUser
        && (
        <Grid stackable>
          <Grid.Column computer={5}>
            <Card.Group centered>
              <Card raised color="yellow">
                <Card.Content>
                  <div style={{textAlign: 'center'}}>
                  <BlurrableImage
                    src={utils.cropUrl(utils.avatarUrl(profileUser), 200, 200)}
                    blurHash={profileUser.avatarBlurHash}
                    width={200} height={200}
                    style={{ borderRadius: '50%' }}
                  />
                  </div>
                  <Card.Header>{profileUser.username}</Card.Header>
                  <Card.Meta>
                    <span className="date">
                      Joined {moment(profileUser.createdAt).fromNow()}
                    </span>
                  </Card.Meta>
                </Card.Content>
                {profileUser.location
                  && (
                  <Card.Content extra textAlign="right">
                    <Icon name="map pin" /> {profileUser.location}
                  </Card.Content>
                  )
                }
                {user && user._id === profileUser._id
                  && (
                  <Card.Content extra textAlign="right">
                    <Link to={`/${profileUser.username}/edit`}>
                      <Icon name="pencil" /> Edit profile
                    </Link>
                  </Card.Content>
                  )
                }
              </Card>

              {(profileUser.bio || profileUser.website || profileUser.twitter || profileUser.facebook) &&
                <Card fluid>
                  <Card.Content>
                    <Card.Header>
                      About {profileUser.username}
                    </Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <p>{profileUser.bio}</p>
                    <List relaxed>
                      {profileUser.website
                        && (
                        <a href={utils.ensureHttp(profileUser.website)} target="_blank" className="item" rel="noopener noreferrer">
                          <List.Icon name="globe" size="large" verticalAlign="middle" />
                          <List.Content>
                            <List.Header>{profileUser.website}</List.Header>
                          </List.Content>
                        </a>
                        )
                      }
                      {profileUser.twitter
                        && (
                          <a href={`https://twitter.com/${profileUser.twitter.replace(/@/g, '')}`} target="_blank" className="item" rel="noopener noreferrer">
                          <List.Icon name="twitter" size="large" verticalAlign="middle" />
                          <List.Content>
                            <List.Header>
                              @{profileUser.twitter.replace(/@/g, '')}
                            </List.Header>
                            <List.Description>Twitter</List.Description>
                          </List.Content>
                        </a>
                        )
                      }
                      {profileUser.facebook
                        && (
                        <a href={`https://facebook.com/${profileUser.facebook}`} target="_blank" className="item" rel="noopener noreferrer">
                          <List.Icon name="facebook" size="large" verticalAlign="middle" />
                          <List.Content>
                            <List.Header>{profileUser.facebook}</List.Header>
                            <List.Description>Facebook</List.Description>
                          </List.Content>
                        </a>
                        )
                      }
                      {profileUser.instagram
                        && (
                        <a href={`https://instagram.com/${profileUser.facebook}`} target="_blank" className="item" rel="noopener noreferrer">
                          <List.Icon name="instagram" size="large" verticalAlign="middle" />
                          <List.Content>
                            <List.Header>{profileUser.instagram}</List.Header>
                            <List.Description>Instagram</List.Description>
                          </List.Content>
                        </a>
                        )
                      }
                      {profileUser.linkedIn
                        && (
                        <a href={`https://linkedin.com/in/${profileUser.linkedIn}`} target="_blank" className="item" rel="noopener noreferrer">
                          <List.Icon name="linkedin" size="large" verticalAlign="middle" />
                          <List.Content>
                            <List.Header>{profileUser.linkedIn}</List.Header>
                            <List.Description>LinkedIn</List.Description>
                          </List.Content>
                        </a>
                        )
                      }
                    </List>
                  </Card.Content>
                </Card>
              }
            </Card.Group>
          </Grid.Column>

          <Grid.Column computer={11}>
            <Outlet />
          </Grid.Column>
        </Grid>
        )
      }
    </Container>
  );
}

export default Profile;
