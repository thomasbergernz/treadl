import actions from '../actions';

const initialState = {
  helpModalOpen: false,
  searchPopupOpen: false,
  searchTerm: '',
  searchResults: {}
};

function app(state = initialState, action) {
  switch (action.type) {
    case actions.app.OPEN_SEARCH_POPUP:
      return Object.assign({}, state, { searchPopupOpen: action.open || false });
    case actions.app.OPEN_HELP_MODAL:
      return Object.assign({}, state, { helpModalOpen: action.open || false });
    case actions.app.UPDATE_SEARCH_TERM:
      return Object.assign({}, state, { searchTerm: action.term, searchResults: {} });
    case actions.app.UPDATE_SEARCH_RESULTS:
      return Object.assign({}, state, { searchResults: action.results, searching: false });
    case actions.app.UPDATE_SEARCHING:
      return Object.assign({}, state, { searching: action.searching });
    default:
      return state;
  }
}

export default app;
