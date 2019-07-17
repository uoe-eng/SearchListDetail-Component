export default {
  // reserved name for showing all collections
  ALL_PAGE_NAME: '_all',
  ALL_PAGE_TEXT: 'ALL',
  DEFAULT_DETAILS_TITLE: 'details',
  DEFAULT_DETAILS_TEXT: '+',
  SAVE_BUTTON_REF: 'save',
  SAVE_BUTTON_TEXT: 'Save',
  CLOSE_BUTTON_REF: 'cancel',
  CLOSE_BUTTON_TEXT: 'Cancel',
  DEFAULT_CASE_SENSITIVE: false,
  DEFAULT_SEARCH_OPERATOR: 'contains',
  SEARCH_OPERATORS: {
    contains: (value, search) => {
      return value.includes(search)
    },
    matches: (value, search) => {
      return value == search
    },
    startsWith: (value, search) => {
      return value.startsWith(search)
    },
    endsWith: (value, search) => {
      return value.endsWith(search)
    },
  },
}
