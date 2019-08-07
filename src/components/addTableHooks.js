import Handsontable from 'handsontable'
import util from './util'

export default function addTableHooks(context) {
  const topTable = context.$refs.topTable.hotInstance
  const bottomTable = context.$refs.bottomTable.hotInstance
  const hooks = Handsontable.hooks

  //////////////////////////////////////////////////////////////////////////////

  // every time a column is sorted by the user, the sorting information for
  // the collection is updated in the collection object

  const afterColumnSort = (currentSortConfig, destinationSortConfigs) => {
    if (currentSortConfig[0] == destinationSortConfigs[0]) return
    if (
      currentSortConfig[0] &&
      destinationSortConfigs[0] &&
      currentSortConfig[0].column == destinationSortConfigs[0].column &&
      currentSortConfig[0].sortOrder == destinationSortConfigs[0].sortOrder
    )
      return
    // set the collection's sorting
    const sorting = destinationSortConfigs[0]
    context.collection.columnSorting = sorting

    context.localstore
      .dispatch('updatesearchFilter', context.collection)
      .then(() => {
        context.populateTables()
      })
  }

  hooks.add('afterColumnSort', afterColumnSort, topTable)
  hooks.add('afterColumnSort', afterColumnSort, bottomTable)

  //////////////////////////////////////////////////////////////////////////////

  // when a cell is edited, the value is updated in the reactive object

  const setAndPatch = (row, col, newValue) => {
    const collection = util.getCollection(context.localstore, context.type)
    const id = collection.searchResults[row]
    const colName = collection.columnNames[col]

    // set the value for the entry in the search results
    const entry = util.getEntry(context.$store, context.type, id)
    const cleanEntry = JSON.parse(JSON.stringify(util.cleanEntry(entry)))
    cleanEntry[colName] = newValue

    // patch up to the server
    context.localstore.dispatch('patch', cleanEntry)
  }

  const afterChangeTop = (change) => {
    if (!change) return

    // interpret details from the given argument 'change'
    const row = change[0][0]
    const col = change[0][1] - 1 // adjust for the leftmost cell
    const newValue = change[0][3]
    if (col >= 0) setAndPatch(row, col, newValue)
  }

  const afterChangeBottom = (change) => {
    if (!change) return

    // find the expanded row
    const expansionState = context.localstore.state.expansionState
    const expanded = expansionState[context.localstore.state.page]
    const expandedRow = context.collection.searchResults.indexOf(expanded)

    // interpret details from the given argument 'change'
    // expanded row will always be found since the bottom table only shows when a row is expanded
    // + 1 so that the first row after the card is 0
    const row = change[0][0] + expandedRow + 1
    const col = change[0][1] - 1 // adjust for the leftmost cell
    const newValue = change[0][3]
    if (col >= 0) setAndPatch(row, col, newValue)
  }

  hooks.add('afterChange', afterChangeTop, topTable)
  hooks.add('afterChange', afterChangeBottom, bottomTable)

  //////////////////////////////////////////////////////////////////////////////

  // hook for when the detail cell is edited (double click or enter)
  // this will trigger the row to be expanded

  const onCellEditModeTop = (row, column) => {
    if (column == 0) topTable.deselectCell()
    context.handleEdit(row, column, topTable)
  }

  const onCellEditModeBottom = (row, column) => {
    if (column == 0) bottomTable.deselectCell()
    context.handleEdit(row, column, bottomTable)
  }

  hooks.add('afterBeginEditing', onCellEditModeTop, topTable)
  hooks.add('afterBeginEditing', onCellEditModeBottom, bottomTable)

  //////////////////////////////////////////////////////////////////////////////

  // hook for tabbing from the table into the card
  // array of input boxes from the card

  const lastInput = () => {
    const inputs = context.$refs.cardview && context.$refs.cardview.$refs.input
    return inputs && inputs[inputs.length - 1]
  }

  const firstInput = () => {
    const inputs = context.$refs.cardview && context.$refs.cardview.$refs.input
    return inputs && inputs[0]
  }

  const tableToCardTop = (e) => {
    if (!topTable.getSelected()) {
      return
    }
    const row = topTable.getSelected()[0][0]
    const col = topTable.getSelected()[0][1]
    const isTopCorner = row == 0 && col == 0
    const isTabForward = e.key == 'Tab' && !e.shiftKey
    if (isTopCorner && isTabForward && context.expanded.id) {
      topTable.deselectCell()
      firstInput().focus()
    }
  }

  const tableToCardBottom = (e) => {
    if (!bottomTable.getSelected()) {
      return
    }
    const row = bottomTable.getSelected()[0][0]
    const col = bottomTable.getSelected()[0][1]
    const isTopCorner = row == 0 && col == 0
    const isTabBack = e.key == 'Tab' && e.shiftKey
    if (isTopCorner && isTabBack && context.expanded.id) {
      e.preventDefault()
      bottomTable.deselectCell()
      // delay ensures the focus happens after all keypress events (hacky?)
      setTimeout(() => {
        lastInput().focus()
      }, 0)
    }
  }

  hooks.add('afterDocumentKeyDown', tableToCardTop, topTable)
  hooks.add('beforeKeyDown', tableToCardBottom, bottomTable)

  //////////////////////////////////////////////////////////////////////////////

  // hooks for wrapping around from the top to the bottom

  const tableWrapAroundTop = (e) => {
    if (!topTable.getSelected()) {
      return
    }
    const row = topTable.getSelected()[0][0]
    const col = topTable.getSelected()[0][1]
    const isTopCorner = row == 0 && col == 0
    const isTabBack = e.key == 'Tab' && e.shiftKey

    if (isTopCorner && isTabBack && context.expanded.id) {
      topTable.deselectCell()

      // delay ensures cell selection happens after all keypress events (hacky?)
      setTimeout(() => {
        // select the last cell
        bottomTable.selectCell(
          bottomTable.countRows() - 1,
          bottomTable.countCols() - 1
        )
      }, 0)
    }
  }

  const tableWrapAroundBottom = (e) => {
    if (!bottomTable.getSelected()) {
      return
    }
    const row = bottomTable.getSelected()[0][0]
    const col = bottomTable.getSelected()[0][1]
    const isTopCorner = row == 0 && col == 0
    const isTabForward = e.key == 'Tab' && !e.shiftKey
    if (isTopCorner && isTabForward && context.expanded.id) {
      bottomTable.deselectCell()
      // select the first cell
      topTable.selectCell(0, 0)
    }
  }

  hooks.add('beforeKeyDown', tableWrapAroundTop, topTable)
  hooks.add('afterDocumentKeyDown', tableWrapAroundBottom, bottomTable)
}
