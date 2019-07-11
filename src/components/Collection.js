import config from './config'

export default class Collection {
  constructor(type, fullCols, previewCols, columnOptions) {
    this.type = type
    this.fullCols = fullCols
    this.previewCols = previewCols
    this.columnOptions = columnOptions
    // this.store = store
    // represents the search results (empty to begin with)
    this.entries = {}
    // the sorting for each column is stored in the collection object
    this.columnSorting = undefined
  }

  // returns the alias for a given column if one is specified, else return column name
  getAlias(columnName, store) {
    // type array
    const columns = store.state.sld.resultOptions[this.type].columns
    let alias
    columns.forEach((column) => {
      if (column.name == columnName) {
        if (!column.alias) {
          // if no alias specified, use the name which is always required
          alias = column.name
        } else {
          alias = column.alias
        }
      }
    })
    return alias
  }

  getEntriesFrom(store) {
    return store.getters['jv/get'](this.type)
  }

  // returns a deep copy of entries that match the search
  filter(search, store) {
    // create array of ids that match filter
    const ids = Object.keys(this.getEntriesFrom(store))
    const filteredIds = ids.filter((id) => {
      // if this entry should be displayed, return true in here
      const entry = this.getEntriesFrom(store)[id]
      const columns = Object.keys(entry)

      // array of booleans for if the value in the column matches the search
      const matchedColumns = columns.map((column) => {
        // don't search anything that isn't a string (for now)
        if (typeof entry[column] != 'string') return false
        // don't search columns that haven't been specified to show
        if (!this.columnOptions[column]) return false
        if (!store.state.sld.searchOptions[this.type][column]) return false
        const operatorName = this.columnOptions[column].searchOperator
        const operator = config.SEARCH_OPERATORS[operatorName]
        if (this.columnOptions[column].caseSensitive) {
          return operator(entry[column], search)
        } else {
          // case insensitive, so convert everything to upper case before searching
          return operator(entry[column].toUpperCase(), search.toUpperCase())
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
      const entryFromStore = this.getEntriesFrom(store)[id]
      filteredEntries[id] = JSON.parse(JSON.stringify(entryFromStore))
    })
    return filteredEntries
  }

  get(id) {
    return this.entries[id]
  }

  // gets the entry but only with keys that aren't objects (also a deep copy)
  getShallow(id) {
    let entry = {}
    const columns = Object.keys(this.entries[id])
    columns.forEach((column) => {
      const columnValue = this.entries[id][column]
      if (typeof columnValue == 'object') return
      entry[column] = columnValue
    })
    return entry
  }

  // returns (in order) the ids of the collection in an array
  ids() {
    return Object.keys(this.entries).sort((a, b) => {
      // normal numerical sort by id
      if (this.columnSorting == undefined) return a - b
      // otherwise sort by column
      const colNumber = this.columnSorting.column - 1
      const colName = this.fullCols[colNumber]
      // the comparator function in sort() expects a number
      if (this.columnSorting.sortOrder == 'asc') {
        return this.entries[a][colName] >= this.entries[b][colName] ? 1 : -1
      } else {
        return this.entries[a][colName] >= this.entries[b][colName] ? -1 : 1
      }
    })
  }

  // given a coordinate from the table, get the id and col names for it
  fromCoordinates(row, col) {
    return {
      id: this.ids()[row],
      col: this.fullCols[col],
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

  getAllData(detailsText) {
    return this.ids().map((id) => {
      // the row items will be determined by this.fullCols
      const row = this.fullCols.map((column) => {
        // special case for relationship column
        if (column.includes('.')) {
          const relCollection = column.split('.')[0]
          const relatedItems = this.entries[id][relCollection]
          // 0 items
          if (!relatedItems) return '0 items'
          // 1 item
          if (relatedItems._jv) return relatedItems[column.split('.')[1]]
          // many items
          const itemCount = Object.keys(relatedItems).length
          return itemCount + ' items...'
        }
        // normal attribute column
        return this.entries[id][column]
      })

      // add the expand details cell to the left of each row
      return [detailsText].concat(row)
    })
  }
}
