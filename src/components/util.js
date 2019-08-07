import config from './config'

export default {
  // returns a collection from the local store
  getCollection: function(localstore, collectionName) {
    const collectionNames = localstore.state.collections.map((c) => c.name)
    const index = collectionNames.indexOf(collectionName)
    if (index === -1) {
      console.error(
        'Collection',
        collectionName,
        'was not found, make sure it is specified in the props.'
      )
    }
    return localstore.state.collections[index]
  },

  // returns an entry from the _jv store
  getEntry: function(globalstore, collectionName, id) {
    return globalstore.getters['jv/get'](collectionName + '/' + id)
  },

  // returns all entries from a present in the _jv store
  getEntries: function(globalstore, collectionName) {
    return globalstore.getters['jv/get'](collectionName)
  },

  // keeps attributes for an entry only if they are not objects
  // returns an entry
  cleanEntry: function(entry) {
    let clean = {
      _jv: entry._jv,
    }
    Object.keys(entry).forEach((column) => {
      if (typeof entry[column] !== 'object') clean[column] = entry[column]
    })
    return clean
  },

  // returns an array of {id, type} representing the related entries of an entry
  getRelatedEntries: function(entry, relationshipColumn) {
    const relCollectionName = relationshipColumn.split('.')[0]
    const relatedEntries = entry._jv.relationships[relCollectionName].data
    if (Array.isArray(relatedEntries)) {
      return relatedEntries
    } else {
      return [relatedEntries]
    }
  },

  // returns an array of ids where each id is an entry that matched the search
  filterEntries: function(globalstore, collection, search) {
    if (search === '') return []
    const entries = this.getEntries(globalstore, collection.name)
    // create array of ids that match filter
    const ids = Object.keys(entries)
    const filteredIds = ids.filter((id) => {
      // if this entry should be displayed, return true in here
      const entry = entries[id]

      // array of booleans for if the value in the column matches the search
      const matchedColumns = collection.options.columns.map((column) => {
        if (column.searchable === false) return false
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

    // sort the ids appropriately
    return filteredIds.sort((a, b) => {
      // normal numerical sort by id
      if (collection.columnSorting == undefined) return a - b

      // otherwise sort by column
      const colNumber = collection.columnSorting.column - 1
      const colName = collection.columnNames[colNumber]

      // the comparator function in sort() expects a number
      if (collection.columnSorting.sortOrder == 'asc') {
        return entries[a][colName] >= entries[b][colName] ? 1 : -1
      } else {
        return entries[a][colName] >= entries[b][colName] ? -1 : 1
      }
    })
  },

  getSplitTableData: function(globalstore, expandedID, collection) {
    const tableData = collection.searchResults.map((id) => {
      const row = collection.columnNames.map((column) => {
        return this.getTableCellData({
          globalstore: globalstore,
          collectionName: collection.name,
          id: id,
          columnName: column,
        })
      })

      // add the expand details cell to the left of each row
      return [config.DETAILS_TEXT].concat(row)
    })

    // using the list of ids find the index of the expanded id
    const expandedRow = collection.searchResults.indexOf(expandedID)

    // if no row is expanded then only return data for the top table
    if (expandedID === undefined) {
      return {
        top: tableData,
        topIDs: collection.searchResults,
        bottom: [],
        bottomIDs: [],
      }
    } else {
      return {
        top: tableData.slice(0, expandedRow),
        topIDs: collection.searchResults.slice(0, expandedRow),
        bottom: tableData.slice(expandedRow + 1, tableData.length),
        bottomIDs: collection.searchResults.slice(
          expandedRow + 1,
          tableData.length
        ),
      }
    }
  },

  // returns the text to display in a table cell
  getTableCellData: function(args) {
    const { globalstore, collectionName, id, columnName } = args
    const entry = this.getEntry(globalstore, collectionName, id)
    // special case for relationship column
    if (columnName.includes('.')) {
      const relatedEntries = this.getRelatedEntries(entry, columnName)
      const itemCount = relatedEntries.length

      // 0 items
      if (itemCount === 0) return '-'

      // 1 item, or if undefined it's just the object (not in array)
      if (itemCount === 1) {
        const relatedEntryLink = relatedEntries[0]
        const relatedEntry = this.getEntry(
          globalstore,
          relatedEntryLink.type,
          relatedEntryLink.id
        )
        // if the entry is empty it is still loading
        if (Object.keys(relatedEntry).length === 0) return '1 item...'
        return relatedEntry[columnName.split('.')[1]]
      }

      // many items
      return itemCount + ' items...'
    }

    // normal attribute column
    return entry[columnName]
  },

  // gets the alias for a column in a collection
  getColumnAlias: function(collection, columnName) {
    let alias
    collection.options.columns.forEach((column) => {
      if (column.name === columnName) {
        alias = column.alias
      }
    })
    return alias
  },

  log: function(...args) {
    console.debug(...args)
  },
}
