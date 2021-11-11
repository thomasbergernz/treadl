export default {

  OPEN_HELP_MODAL: 'OPEN_HELP_MODAL',
  OPEN_SEARCH_POPUP: 'OPEN_SEARCH_POPUP',
  UPDATE_SEARCH_TERM: 'UPDATE_SEARCH_TERM',
  UPDATE_SEARCH_RESULTS: 'UPDATE_SEARCH_RESULTS',
  UPDATE_SEARCHING: 'UPDATE_SEARCHING',

  openHelpModal(open) {
    return { type: this.OPEN_HELP_MODAL, open };
  },
  updateSearchTerm(term) {
    return { type: this.UPDATE_SEARCH_TERM, term };
  },
  updateSearchResults(results) {
    return { type: this.UPDATE_SEARCH_RESULTS, results };
  },
  updateSearching(searching) {
    return { type: this.UPDATE_SEARCHING, searching};
  },
  openSearchPopup(open) {
    return { type: this.OPEN_SEARCH_POPUP, open };
  },
};
