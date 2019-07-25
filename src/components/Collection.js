import config from './config'

export default class Collection {
  constructor(options, localstore, globalstore) {
    this.name = options.name
    this.options = options
    this.localstore = localstore

    // this is a getter function so that the data in the store (which is potentially circular)
    // is not stored in this class object and passed around in vue
    this.getStore = () => globalstore

    // represents the search results (empty to begin with)
    this.searchResults = {}

    // fill out defaults for options
    this.options.columns.forEach((column) => {
      if (column.name === undefined)
        console.error('no name given to column in', this)

      if (column.searchOperator === undefined)
        column.searchOperator = 'contains'

      if (column.alias === undefined) column.alias = column.name
      if (column.caseSensitive === undefined) column.caseSensitive = false

      column.searchable = true
    })

    if (this.options.previewOrder === undefined) {
      this.options.previewOrder = this.columnNames
    }
  }

  get globalstore() {
    return this.getStore()
  }

  get columnNames() {
    return this.options.columns.map((column) => column.name)
  }

  // patches an entry to the server
  patch(id) {
    // console.debug('patching search result with id', id)
    const entry = this.getClean(id)
    this.globalstore.dispatch('jv/patch', entry).then(() => {
      this.localstore.dispatch('updateSearchResults')
    })
  }

  // returns the alias for a given column if one is specified, else return column name
  getAlias(columnName) {
    let alias
    this.options.columns.forEach((column) => {
      if (column.name == columnName) {
        alias = column.alias
      }
    })
    return alias
  }

  getEntriesFromStore() {
    return this.globalstore.getters['jv/get'](this.name)
  }

  get(id, deep = false) {
    // if it isn't in the search results, add it from the store
    if (!this.searchResults[id]) {
      this.searchResults[id] = this.deep(this.getEntriesFromStore()[id])
    }
    let entry = this.searchResults[id]
    return deep ? this.deep(entry) : entry
  }

  // get a version (reference) of a search result without any of the relationships by id
  getClean(id) {
    const entry = this.get(id)
    let clean = {
      _jv: entry._jv,
    }
    Object.keys(entry).forEach((column) => {
      if (typeof entry[column] === 'object') return
      clean[column] = entry[column]
    })
    return clean
  }

  // returns a list of deeply copied entries from the _jv store that match the search
  filter(search) {
    if (search === '') return {}

    const storeEntries = this.getEntriesFromStore()

    // create array of ids that match filter
    const ids = Object.keys(storeEntries)

    const filteredIds = ids.filter((id) => {
      // if this entry should be displayed, return true in here
      const entry = storeEntries[id]

      // array of booleans for if the value in the column matches the search
      const matchedColumns = this.options.columns.map((column) => {
        if (!column.searchable) return false
        const value = entry[column.name]
        // for example for relationships
        if (value === undefined) return false
        const operator = config.SEARCH_OPERATORS[column.searchOperator]
        if (column.caseSensitive) {
          return operator(value, search)
        } else {
          return operator(value.toUpperCase(), search.toUpperCase())
        }
      })

      // apply OR operator on all values of the array
      // if one or more column matches, this entry will appear in the search
      const entryMatchesFilter = matchedColumns.reduce((a, b) => {
        return a || b
      })
      return entryMatchesFilter
    })

    // convert ids to entries
    let filteredEntries = {}
    filteredIds.forEach((id) => {
      const entryFromStore = this.getEntriesFromStore()[id]
      filteredEntries[id] = this.deep(entryFromStore)
    })
    return filteredEntries
  }

  // returns (in order) the ids of the collection in an array
  ids() {
    return Object.keys(this.searchResults).sort((a, b) => {
      // normal numerical sort by id
      if (this.columnSorting == undefined) return a - b

      // otherwise sort by column
      const colNumber = this.columnSorting.column - 1
      const colName = this.columnNames[colNumber]

      // the comparator function in sort() expects a number
      const results = this.searchResults
      if (this.columnSorting.sortOrder == 'asc') {
        return results[a][colName] >= results[b][colName] ? 1 : -1
      } else {
        return results[a][colName] >= results[b][colName] ? -1 : 1
      }
    })
  }

  // given a coordinate from the table, get the id and col names for it
  fromCoordinates(row, col) {
    return {
      id: this.ids()[row],
      col: this.columnNames[col],
    }
  }

  // create the table data for the two tables depending on the expanded row
  splitIntoTables(expandedID, detailsText) {
    // for each id in the collection we need to compute the data for the row
    let data = this.getAllData(detailsText)

    // using the list of ids find the index of the expanded id
    const expandedRow = this.ids().indexOf(expandedID.id)

    // if no row is expanded then only return data for the top table
    if (expandedID.id == null) {
      return {
        top: data,
        topIDs: this.ids(),
        bottom: [],
        bottomIDs: [],
      }
    } else {
      return {
        top: data.slice(0, expandedRow),
        topIDs: this.ids().slice(0, expandedRow),
        bottom: data.slice(expandedRow + 1, data.length),
        bottomIDs: this.ids().slice(expandedRow + 1, data.length),
      }
    }
  }

  // create a table of arrays that will be what is displayed in the tables
  getAllData(detailsText) {
    return this.ids().map((id) => {
      const row = this.columnNames.map((column) => {
        // special case for relationship column
        if (column.includes('.')) {
          const relCollection = column.split('.')[0]
          const relatedItems = this.get(id)[relCollection]
          const itemCount = Object.keys(relatedItems).length

          // 0 items
          if (itemCount == 0) return '-'

          // 1 item
          if (itemCount == 1) {
            const relatedItem = relatedItems[Object.keys(relatedItems)[0]]
            const relatedColumn = column.split('.')[1]
            const relatedEntry = this.globalstore.getters['jv/get'](
              relatedItem._jv.type
            )[relatedItem._jv.id]
            return relatedEntry[relatedColumn]
          }

          // many items
          return itemCount + ' items...'
        }

        // normal attribute column
        return this.searchResults[id][column]
      })

      // add the expand details cell to the left of each row
      return [detailsText].concat(row)
    })
  }

  deep(object) {
    return JSON.parse(JSON.stringify(object))
  }
}
