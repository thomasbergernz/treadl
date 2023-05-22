import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Popup, Loader, Grid, List } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import actions from '../../actions';
import api from '../../api';

import UserChip from './UserChip';

const StyledSearchBar = styled.div`
  background-color:rgba(0,0,0,0.1);
  padding-left:5px;
  padding-top: 3px;
  border: none;
  border-radius:5px;
  transition: background-color 0.5s;
  margin-right:8px;
  display:inline-block;
  &:before{
    display:inline-block;
    content: '🔍';
  }
  &:focus-within{
    background-color:rgba(250,250,250,0.5);
    color:rgb(50,50,50);
    input {
      outline: none;
    }
    input::placeholder {
      color:black;
    }
  }
  input{
    border:none;
    background:none;
    padding:8px;
  }
`;

export default function SearchBar() {
  const dispatch = useDispatch();
  const { searchPopupOpen, searchTerm, searchResults, searching } = useSelector(state => {
    const { searchPopupOpen, searchTerm, searchResults, searching } = state.app;
    return { searchPopupOpen, searchTerm, searchResults, searching };
  });
  
  useEffect(() => {
    dispatch(actions.app.openSearchPopup(false));
  }, [dispatch]);
  
  const search = () => {
    dispatch(actions.app.updateSearching(true));
    api.search.all(searchTerm, r => dispatch(actions.app.updateSearchResults(r)));
  };
  
  return (
    <Popup basic on='focus' open={searchPopupOpen}
    onOpen={e => dispatch(actions.app.openSearchPopup(true))} onClose={e => dispatch(actions.app.openSearchPopup(false))}
    trigger={<StyledSearchBar><input placeholder='Click to search...' value={searchTerm} onChange={e => dispatch(actions.app.updateSearchTerm(e.target.value))} onKeyDown={e => e.keyCode === 13 && search()} /></StyledSearchBar>}
    content={<div style={{width: 300}} className='joyride-search'>
      {!searchResults?.users && !searchResults?.groups ?
        <small>
          {searching
            ? <span><Loader size='tiny' inline active style={{marginRight: 10}}/> Searching...</span>
            : <span>Type something and press enter to search</span>
          }
        </small>
        : <>
        {(!searchResults.users?.length && !searchResults?.groups?.length && !searchResults?.projects?.length) ?
          <span><small>No results found</small></span>
        :
        <Grid stackable>
          {searchResults?.users?.length > 0 &&
            <Grid.Column width={6}>
              {searchResults?.users?.map(u =>
                <div style={{marginBottom: 5}}><UserChip user={u} key={u._id} /></div>
              )}
            </Grid.Column>
          }
          {(searchResults?.projects.length > 0 || searchResults.groups.length > 0) &&
            <Grid.Column width={10}>
              <List>
                {searchResults?.projects?.map(p =>
                  <List.Item key={p._id}>
                    <List.Icon name='book' size='large' verticalAlign='middle' />
                    <List.Content>
                      <List.Header as={Link} to={'/' + p.fullName}>{p.name}</List.Header>
                      <List.Description><UserChip compact user={p.owner} /></List.Description>
                    </List.Content>
                  </List.Item>
                )}
                {searchResults?.groups?.map(g =>
                  <List.Item key={g._id}>
                    <List.Icon name='users' size='large' verticalAlign='middle' />
                    <List.Content>
                      <List.Header as={Link} to={`/groups/${g._id}`}>{g.name}</List.Header>
                      <List.Description><small>{g.closed ? <span><Icon name='lock' /> Closed group</span> : <span>Open group</span>}</small></List.Description>
                    </List.Content>
                  </List.Item>
                )}
              </List>
            </Grid.Column>
          }
        </Grid>
      }</>}
    </div>} />
  );
}