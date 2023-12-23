import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Popup, Loader, Grid, List, Input, Icon } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import actions from '../../actions';
import api from '../../api';

import UserChip from './UserChip';

const StyledSearchBar = styled.div`
  background-color:rgba(0,0,0,0.1);
  padding:5px;
  border: none;
  border-radius:5px;
  transition: background-color 0.5s;
  &:focus-within{
    background-color:rgba(250,250,250,0.5);
  }
  input::placeholder {
    color: black !important;
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
    if (searchTerm?.length < 2) return;
    dispatch(actions.app.updateSearching(true));
    api.search.all(searchTerm, r => dispatch(actions.app.updateSearchResults(r)));
  };
  
  const debouncedFetch = useDebouncedCallback(search, 500);
  
  useEffect(() => {
    debouncedFetch();
  }, [searchTerm]);
  
  return (
    <Popup basic on='focus' open={searchPopupOpen}
      onOpen={e => dispatch(actions.app.openSearchPopup(true))} onClose={e => dispatch(actions.app.openSearchPopup(false))}
      trigger={
        <StyledSearchBar><Input transparent size='small' placeholder='Search...' icon='search' iconPosition='left' value={searchTerm} onChange={e => dispatch(actions.app.updateSearchTerm(e.target.value))} onKeyDown={e => e.keyCode === 13 && search()} /></StyledSearchBar>
      }
      content={<div style={{width: 500}} className='joyride-search'>
        {!searchResults?.projects && !searchResults.objects && !searchResults?.users && !searchResults?.groups ?
          <p><strong>
            {searching
              ? <span><Loader size='tiny' inline active style={{marginRight: 10}}/> Searching...</span>
              : <span>Type something to search...</span>
            }
          </strong></p>
          : <>
          {(!searchResults.users?.length && !searchResults?.groups?.length && !searchResults?.projects?.length && !searchResults?.objects?.length) ?
            <span><small>No results found</small></span>
          :
          <Grid stackable>
            {searchResults?.objects?.length > 0 &&
              <Grid.Column width={16}>
                <h4>My items</h4>
                <List>
                  {searchResults?.objects?.map(o => {
                    let icon;
                    let text;
                    if (o.type === 'pattern') {
                      icon = 'pencil';
                      text = 'Pattern';
                    }
                    else if (o.type === 'file' && o.isImage) {
                      icon = 'image';
                      text = 'Image';
                    }
                    else {
                      icon = 'file outline';
                      text = 'File';
                    }
                    return (
                    <List.Item key={o._id}>
                      <List.Icon name={icon} size='large' verticalAlign='middle' />
                      <List.Content>
                        <List.Header as={Link} to={'/' + o.path}>{o.name}</List.Header>
                        <List.Description>{text}</List.Description>
                      </List.Content>
                    </List.Item>
                    );
                  })}
                </List>
              </Grid.Column>
            }
            {searchResults?.users?.length > 0 &&
              <Grid.Column width={6}>
                <h4>Users</h4>
                {searchResults?.users?.map(u =>
                  <div style={{marginBottom: 5}}><UserChip user={u} key={u._id} /></div>
                )}
              </Grid.Column>
            }
            {(searchResults?.projects.length > 0 || searchResults.groups.length > 0) &&
              <Grid.Column width={10}>
                <h4>Projects & groups</h4>
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
      </div>} 
    />
  );
}