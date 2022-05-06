import React, { Component } from 'react';
import { Loader, Dropdown, Modal, Icon, Message, Divider, Segment, Button, Card } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import utils from 'utils/utils.js';

import actions from 'actions';
import api from 'api';

class BillingSettings extends Component {
  constructor(props) {
    super(props);
    this.state = { card: null, planId: null };
  }

  componentDidMount() {
    api.billing.get(({ planId, card }) => this.setState({ planId, card }));
  }

  getCardIcon = (brand) => {
    if (brand === 'Visa') return 'visa';
    if (brand === 'MasterCard') return 'mastercard';
    if (brand === 'American Express') return 'amex';
    return 'credit card';
  }

  loadStripe = () => {
    this.setState({ showCardModal: true });
    this.stripe = window.Stripe(process.env.REACT_APP_STRIPE_KEY);
    const elements = this.stripe.elements(); this.card = elements.create('card', {
      style: {
        base: {
          color: '#32325d',
          lineHeight: '25px',
          fontFamily: '"Lato", sans-serif',
          fontSize: '20px',
          '::placeholder': {
            color: 'rgb(180,180,180)',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    });
    setTimeout(() => this.card.mount('#stripe-card'), 500);
  }

  saveCard = () => {
    this.setState({ cardLoading: true });
    this.stripe.createToken(this.card).then((result) => {
      if (result.error) {
        this.setState({ cardLoading: false });
      } else {
        api.billing.updateCard(result, ({ card }) => {
          this.setState({ showCardModal: false, cardLoading: false, card });
          toast.info('Card updated successfully');
        }, (err) => {
          toast.error(err.message);
          this.setState({ cardLoading: false });
        });
      }
    });
  }

  deleteCard = () => {
    utils.confirm('Really delete this payment card?', 'We recommend keeping a card on your account so you don\'t lose access to your projects when your plan is due for renewal.').then(() => {
      this.setState({ cardLoading: true });
      api.billing.deleteCard(() => {
        this.setState({ card: null, cardLoading: false });
        toast.info('Payment card deleted');
      }, (err) => {
        toast.error(err.message);
        this.setState({ cardLoading: false });
      });
    }, () => {});
  }

  selectPlan = (planId) => {
    const text = planId === 'free'
      ? 'Switching to the free plan will cancel your current subscription. Your account will be updated right away and you will not be charged again until you re-subscribe to a paid plan. Please note that you will lose access to paid-for features and may lose access to private projects.'
      : 'Thank you for changing your plan! Your account will be updated right away. We will charge your card now, but if you are switching from another paid plan the payment will be prorated.';
    utils.confirm('Changing your plan', `${text} Do you want to continue?`).then(() => {
      this.setState({ planLoading: true });
      api.billing.selectPlan(planId, (response) => {
        this.setState({ planId: response.planId, planLoading: false });
        this.props.onUpdatePlan(response.planId);
        toast.info('Your plan was updated successfully');
      }, (err) => {
        this.setState({ planLoading: false });
        toast.error(err.message);
      });
    }, () => {});
  }

  render() {
    const { showCardModal, cardLoading, planLoading, planId, card } = this.state;
    return (
      <div>
        <Segment>
          <h3>Plan</h3>
          <Card.Group stackable centered itemsPerRow={2} style={{ marginTop: 30, marginBottom: 30 }}>
            {utils.plans.map(p => (
              <Card key={p.id}>
                <Card.Content>
                  <Card.Header textAlign="center">{p.name}</Card.Header>
                  <Card.Meta textAlign="center">{p.description}</Card.Meta>
                  <Card.Meta textAlign="center">
                    <strong>
                      {p.price} per month
                    </strong>
                  </Card.Meta>
                  <Divider hidden />
                  {p.features.map((f, i) => (
                    <p key={i}>
                      <Icon style={{ color: 'green' }} name="check circle outline" /> {f}
                    </p>
                  ))}
                </Card.Content>
                <Card.Content extra>
                  {p.id === (planId || 'free')
                    ? <Button color="teal" fluid icon="check" content="Selected" loading={planLoading} />
                    : <Button color="teal" basic fluid content="Activate" onClick={e => this.selectPlan(p.id)} loading={planLoading} />
                  }
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Segment>

        <Segment>
          <h3>Payment method</h3>
          {card
            ? (
              <Card color="green">
                <Loader active={cardLoading} />
                <Card.Content>
                  <h2><Icon name={`cc ${this.getCardIcon(card.brand)}`} /></h2>
                  <h3 style={{fontFamily: 'Monospace'}}>
                    **** **** **** {card.last4}
                  </h3>
                </Card.Content>
                <Card.Content extra>
                  <span style={{fontFamily: 'Monospace'}}>Expires {card.exp_month}/{card.exp_year}</span>
                  <Dropdown text="Options" style={{ float: 'right' }}>
                    <Dropdown.Menu>
                      <Dropdown.Item content="Update card details" icon="credit card" onClick={this.loadStripe} />
                      <Dropdown.Item content="Delete card" icon="trash" onClick={this.deleteCard} />
                    </Dropdown.Menu>
                  </Dropdown>
                </Card.Content>
              </Card>
            )
            : (
              <Message>
                <Message.Header>
                  <Icon name="credit card" /> You don't currently have a payment method setup
                </Message.Header>
                <p>To sign-up for a paid plan, or to ensure your access to your Treadl projects is un-interrupted, please add a payment card to your account.</p>
                <h4>
                  <Icon name="visa" />
                  <Icon name="mastercard" />
                  <Icon name="amex" />
                  <Icon name="diners club" />
                </h4>
                <Button color="yellow" icon="credit card" content="Add a payment card" onClick={this.loadStripe} />
              </Message>
            )
          }

          <Modal open={showCardModal}>
            <Modal.Header>Add a card to your account</Modal.Header>
            <Modal.Content image>
              <Modal.Description>
                <Message>
                  <Message.Content>
                    <Message.Header>
                      <Icon name="lock" /> Secure payments
                    </Message.Header>
                    <p>We use Stripe <Icon name="stripe" /> to handle payments. Treadl never sees or stores your full card details.</p>
                  </Message.Content>
                </Message>
                <Divider hidden />
                <p><strong>Your card details</strong></p>
                <div id="stripe-card" />
                <Divider hidden />
                <p>Adding a card does not mean you will be charged right away. We just use it to collect payment when you're on a paid-for plan.</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button basic content="Cancel" onClick={e => this.setState({ showCardModal: false })} />
              <Button color="teal" content="Save card to your account" onClick={this.saveCard} loading={cardLoading} />
            </Modal.Actions>
          </Modal>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
  return { user };
};
const mapDispatchToProps = dispatch => ({
  onUpdatePlan: plan => dispatch(actions.auth.updatePlan(plan)),
});
const BillingSettingsContainer = connect(
  mapStateToProps, mapDispatchToProps,
)(BillingSettings);

export default BillingSettingsContainer;
