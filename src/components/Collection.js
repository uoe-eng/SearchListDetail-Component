export default class Collection {
  constructor(options) {
    this.name = options.name
    this.options = options

    // represents the search results (empty to begin with)
    this.searchResults = []

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

    if (this.options.show === undefined) {
      this.options.show = true
    }
  }

  get columnNames() {
    return this.options.columns.map((column) => column.name)
  }
}
