export default {
  // reserved name for showing all collections
  ALL_PAGE_NAME: '_all',
  ALL_PAGE_TEXT: 'ALL',
  STORE_NAME: '_sld',
  DETAILS_TITLE: 'details',
  DETAILS_TEXT: '+',
  SAVE_BUTTON_REF: 'save',
  SAVE_BUTTON_TEXT: 'Save',
  CLOSE_BUTTON_REF: 'cancel',
  CLOSE_BUTTON_TEXT: 'Cancel',
  DEFAULT_CASE_SENSITIVE: false,
  DEFAULT_SEARCH_OPERATOR: 'contains',
  ADV_SEARCH_COLLECTION_TITLE_PREPEND: 'Collection: ',
  SHORT_SEARCH_TIMEOUT: 500,
  LONG_SEARCH_TIMEOUT: 2000,
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
  ILIKE_FILTERS: {
    conatins: (search) => {
      return '*' + search + '*'
    },
    matches: (search) => {
      return search
    },
    startsWith: (search) => {
      return search + '*'
    },
    endsWith: (search) => {
      return '*' + search
    },
  },
}
