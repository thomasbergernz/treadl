import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, Icon, List, Container, Card, Grid, Message } from 'semantic-ui-react';
import { Link, Routes, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import utils from 'utils/utils';
import actions from 'actions';
import api from 'api';

import EditProfile from './EditProfile';
import ProfileProjects from './ProfileProjects';
import BlurrableImage from 'components/includes/BlurrableImage';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  componentDidMount() {
    this.setState({ loading: true });
    api.users.get(this.props.match.params.username, user => {
      this.props.onReceiveUser(user);
      this.setState({ loading: false });
    }, err => {
      this.props.onRequestFailed(err);
      this.setState({ loading: false });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.username !== prevProps.match.params.username) {
      api.users.get(this.props.match.params.username, this.props.onReceiveUser);
    }
  }

  render() {
    const { loading } = this.state;
    const { user, profileUser, errorMessage } = this.props;
    return (
      <Container style={{ marginTop: '40px' }}>
        <Helmet title={profileUser?.username ? `${profileUser.username}'s Profile` : 'Profile'} />
        {loading && !profileUser &&
          <div style={{textAlign: 'center'}}>
            <h4>Loading {this.props.match.params.username}'s profile...</h4>
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
              <Routes>
                <Route path="/:username/edit" element={<EditProfile />} />
                <Route element={<ProfileProjects />} />
              </Routes>
            </Grid.Column>
          </Grid>
          )
        }
      </Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const users = state.users.users;
  const profileUser = users.filter(u => ownProps.match.params.username === u.username)[0];
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user, profileUser, loading: state.users.loading, errorMessage: state.users.errorMessage };
};
const mapDispatchToProps = dispatch => ({
  onRequestUser: () => dispatch(actions.users.request()),
  onRequestFailed: err => dispatch(actions.users.requestFailed(err)),
  onReceiveUser: user => dispatch(actions.users.receive(user)),
});
const ProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);

export default ProfileContainer;
