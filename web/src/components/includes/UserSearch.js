import React, { Component } from 'react';
import { Menu, Popup, Input } from 'semantic-ui-react';
import { connect } from 'react-redux'
import api from 'api';

class UserSearch extends Component {
  
  constructor(props) {
    super(props);
    this.state = { open: false, searchTerm: '', oldSearchTerm: '', searchResults: null, searching: false };
  }
  componentDidMount() {
    this.searcher = setInterval(() => {
      if (this.state.searchTerm !== this.state.oldSearchTerm) this.search();
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(this.searcher);
  }

  updateSearchTerm = e => {
    this.setState({ searching: true, searchTerm: e.target.value })
  }
  search = () => {
    this.setState({ open: false, searching: true, oldSearchTerm: this.state.searchTerm });
    if (!this.state.searchTerm) return this.setState({ searching: false });
    api.search.users(this.state.searchTerm, searchResults => this.setState({ open: true, searching: false, searchResults }), err => this.setState({searching: false}));
  }
  
  inputClicked = () => {
    if (this.state.searchResults) this.setState({ open: true });
  }
  onSelected = user => {
    this.props.onSelected && this.props.onSelected(user);
  }

  render() {
    const { searchResults, searching, open } = this.state;
    const { fluid } = this.props;
    return (
      <Popup hoverable position='bottom left' open={open} onClose={e => this.setState({ open: false })}
        trigger={<Input fluid={fluid} icon='search' iconPosition='left' placeholder='Search for a username...' onChange={this.updateSearchTerm} loading={searching} onClick={this.inputClicked}/>}
        content={(
          <Menu borderless vertical>
            {searchResults && searchResults.map(r => 
              <Menu.Item key={r._id} as='a' icon='user' content={r.username} onClick={e => this.onSelected(r)} image={r.avatarUrl}/>
            )}
          </Menu>
        )}
      />
    );
  }
}


const UserSearchContainer = connect(null, null)(UserSearch);

export default UserSearchContainer;
