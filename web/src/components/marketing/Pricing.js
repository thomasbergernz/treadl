import React, { Component } from 'react';
import { Message, Card, Icon, Divider, Button, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import api from 'api';

class Pricing extends Component {
  constructor(props) {
    super(props);
    this.state = { plans: [] };
  }

  componentDidMount() {
    api.billing.getPlans(plans => this.setState({ plans }));
  }

  render() {
    const { user } = this.props;
    return (
      <Container style={{ marginTop: 30 }}>
        <h1>Pricing</h1>
        <p>Creating a Treadl account is free, but you can choose to pay for extra features. We only require card details when you decide to subscribe to a paid plan.</p>

        <Card.Group itemsPerRow={2}>
          <Card>
            <Card.Content>
              <Card.Header>How come it's free?</Card.Header>
              <p>Treadl offers several key features to free account-holders. For many people, the free account will be enough, but others may want to subscribe to a paid plan for extra features.</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Card.Header>You own your data</Card.Header>
              <p>We will never claim any ownership of your own content that you create using Treadl or upload to your Treadl account - even for free accounts.</p>
            </Card.Content>
          </Card>
        </Card.Group>

        <Divider section />
        <h2>Plans</h2>
        <p>You can select and subscribe to a plan after you've created a free account.</p>
        {user &&
          <Message>
            <p>{user.username}, you can update your plan at any time by visiting your billing settings page.</p>
            <Button as={Link} to='/settings/billing' color='blue' icon='settings' content='Billing settings' />
          </Message>
        }
        <Card.Group stackable centered itemsPerRow={3} style={{ marginTop: 30, marginBottom: 30 }}>
          {this.state.plans.map(p => (
            <Card key={p.id}>
              <Card.Content textAlign="center">
                <Card.Header>{p.name}</Card.Header>
                <Card.Meta>{p.description}</Card.Meta>
                <Card.Meta><strong>{p.price} per month</strong>
                </Card.Meta>
              </Card.Content>
              <Card.Content>
                {p.features.map((f, i) => (
                  <p key={i}>
                    <Icon style={{ color: 'green' }} name="check circle outline" /> {f}
                  </p>
                ))}
              </Card.Content>
              {!user &&
                <Card.Content extra>
                  <Button fluid size="small" color="teal" content="Create your account" onClick={this.props.onRegisterClicked} />
                </Card.Content>
              }
            </Card>
          ))}
        </Card.Group>

        {!user &&
          <div>
            <h2>Interested to find out more?</h2>
            <p>Create your free account today to see what it's about.</p>
            <Button color="teal" content="Sign-up" onClick={this.props.onRegisterClicked} />
          </div>
        }
      </Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user };
};
const PricingContainer = connect(
  mapStateToProps,
)(Pricing);

export default PricingContainer;
