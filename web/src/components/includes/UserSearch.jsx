import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Popup, Input } from 'semantic-ui-react';
import api from '../../api';

function UserSearch({ onSelected, fluid }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [oldSearchTerm, setOldSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState();
  const [searching, setSearching] = useState(false);

  const updateSearchTerm = e => {
    setSearching(true);
    setSearchTerm(e.target.value);
  };

  const search = useCallback(() => {
    if (searchTerm === oldSearchTerm) return;
    setOpen(false);
    setSearching(true);
    setOldSearchTerm(searchTerm);
    if (!searchTerm) return setSearching(false);
    api.search.users(searchTerm, searchResults => {
      setOpen(true);
      setSearching(false);
      setSearchResults(searchResults);
    }, () => setSearching(false));
  }, [oldSearchTerm, searchTerm]);
  useEffect(() => {
    const searcher = setInterval(() => search(), 500);
    return () => clearInterval(searcher);
  }, [search]);

  const inputClicked = () => {
    if (searchResults) setOpen(true);
  };
  const choose = user => {
    onSelected && onSelected(user);
  };

  return (
    <Popup hoverable position='bottom left' open={open} onClose={e => setOpen(false)}
      trigger={<Input fluid={fluid} icon='search' iconPosition='left' placeholder='Search for a username...' onChange={updateSearchTerm} loading={searching} onClick={inputClicked}/>}
      content={(
        <Menu borderless vertical>
          {searchResults && searchResults.map(r =>
            <Menu.Item key={r._id} as='a' icon='user' content={r.username} onClick={e => choose(r)} image={r.avatarUrl}/>
          )}
        </Menu>
      )}
    />
  );
}

export default UserSearch;
