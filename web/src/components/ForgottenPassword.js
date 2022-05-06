import React, { Component } from 'react';
import {
  Card, Input, Divider, Button,
} from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import api from 'api';

function ForgottenPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  sendEmail = () => {
    setLoading(true);
    api.auth.sendPasswordResetEmail(email, () => {
      setLoading(false);
      toast.info('If your account exists, a password email has been sent');
      navigate('/');
    }, (err) => {
      setLoading(false);
      toast.error(err.message);
    });
  }

  return (
    <Card.Group centered style={{ marginTop: 50 }}>
      <Card raised color="yellow">
        <Card.Content>
          <Card.Header>Forgotten your password?</Card.Header>
          <Card.Meta>Type your email address below, and we'll send you a password-reset email.</Card.Meta>
          <Divider hidden />
          <Input fluid type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mary@example.com" autoFocus />
        </Card.Content>
        <Card.Content extra textAlign="right">
          <Button basic onClick={() => navigate('/'))} content="Cancel" />
          <Button color="teal" content="Send email" onClick={sendEmail} loading={loading} />
        </Card.Content>
      </Card>
    </Card.Group>
  );
}

const mapStateToProps = state => ({ });
const mapDispatchToProps = dispatch => ({
});
const ForgottenPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ForgottenPassword);

export default ForgottenPasswordContainer;
