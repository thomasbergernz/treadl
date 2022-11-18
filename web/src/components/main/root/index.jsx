import React, { useState, useEffect } from 'react';
import { Table, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import api from '../../../api';

function Root() {
  const [users, setUsers] = useState([]);

  const { user } = useSelector(state => {
    const user = state.users.users.filter(u => state.auth.currentUserId === u._id)[0];
    return { user };
  });

  useEffect(() => {
    if (!(user?.roles?.indexOf('root') > -1)) return;
    api.root.getUsers(({ users}) => {
      setUsers(users);
    });
  }, [user]);

  const testSentry = () => {
    const x = {};
    console.log(x.y.z);
  }

  return (
    <Container style={{ marginTop: '40px' }}>
      <button onClick={testSentry}>Test Sentry</button>
      <h2>Users</h2>
      <Table compact basic>
        <Table.Header>
          <Table.Row>
            <Table.Cell>Username</Table.Cell>
            <Table.Cell>Joined</Table.Cell>
            <Table.Cell>Last seen</Table.Cell>
            <Table.Cell>Groups</Table.Cell>
            <Table.Cell>Projects</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map(u =>
            <Table.Row key={u._id}>
              <Table.Cell>
                <Link to={`/${u.username}`}>{u.username}</Link> <br /> {u.email}
              </Table.Cell>
              <Table.Cell>{moment(u.createdAt).format('DD/MM/YYYY HH:mm')}</Table.Cell>
              <Table.Cell>{moment(u.lastSeenAt).format('DD/MM/YYYY HH:mm')}</Table.Cell>
              <Table.Cell>
                {u.groupMemberships?.map(g =>
                  <><Link key={g._id} to={`/groups/${g._id}`}>{g.name}</Link><br/></>
                )}
              </Table.Cell>
              <Table.Cell>
                {u.projects?.map(p =>
                  <><Link key={p._id} to={`/${u.username}/${p.path}`}>{p.name}</Link><br/></>
                )}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  );
}

export default Root;
