import React, { useState } from 'react';
import {
  Card, Input, Divider, Button,
} from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const resetPassword = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    setLoading(true);
    api.auth.updatePasswordWithToken(token, password, () => {
      setLoading(false);
      toast.info('Password changed successfully.');
      navigate('/');
    }, (err) => {
      setLoading(false);
      toast.error(err.message);
    });
  };

  return (
    <Card.Group centered style={{ marginTop: 50 }}>
      <Card raised color="yellow">
        <Card.Content>
          <Card.Header>Enter a new password</Card.Header>
          <Card.Meta>Enter a new password below.</Card.Meta>
          <Divider hidden />
          <Input fluid type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
        </Card.Content>
        <Card.Content extra textAlign="right">
          <Button color="teal" content="Change password" onClick={resetPassword} loading={loading} />
        </Card.Content>
      </Card>
    </Card.Group>
  );
}

export default ResetPassword;
