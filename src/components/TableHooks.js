import Handsontable from 'handsontable'

export default {
  // every time a column is sorted by the user, the sorting information for
  // the collection is updated in the collection object
  afterColumnSort: (context) => {
    const hook = (currentSortConfig, destinationSortConfigs) => {
      // set the collection's sorting
      const sorting = destinationSortConfigs[0]
      context.collection.columnSorting = sorting
      // handsontable will not be able to sort the whole table when it is split
      // into two tables, so update the view to redraw the two tables
      context.$store.dispatch('refreshPage')
    }
    Handsontable.hooks.add(
      'afterColumnSort',
      hook,
      context.$refs.topTable.hotInstance
    )
    Handsontable.hooks.add(
      'afterColumnSort',
      hook,
      context.$refs.bottomTable.hotInstance
    )
  },
  // when a cell is edited, the value is updated in the reactive object
  addAfterChange: (context) => {
    const setAndPatch = (row, col, newValue) => {
      const collection = context.collections[context.type]
      const id = collection.fromCoordinates(row, col).id
      const colName = collection.fromCoordinates(row, col).col
      const record = context.$store.getters['jv/get'](`${context.type}/${id}`)
      const deepRecord = JSON.parse(JSON.stringify(record))
      deepRecord[colName] = newValue
      context.$store.dispatch('jv/patch', deepRecord)
    }
    Handsontable.hooks.add(
      'afterChange',
      (change) => {
        // interpret details from the given argument 'change'
        const row = change[0][0]
        const col = change[0][1] - 1 // adjust for the leftmost cell
        const newValue = change[0][3]
        if (col >= 0) setAndPatch(row, col, newValue)
      },
      context.$refs.topTable.hotInstance
    )

    Handsontable.hooks.add(
      'afterChange',
      (change) => {
        // find the expanded row
        const allExpanded = context.$store.state.sld.allExpanded
        const expanded = allExpanded[context.$store.state.sld.page]
        const expandedRow = context.collection.ids().indexOf(expanded)
        // interpret details from the given argument 'change'
        // expanded row will always be found since the bottom table only shows when a row is expanded
        // + 1 so that the first row after the card is 0
        const row = change[0][0] + expandedRow + 1
        const col = change[0][1] - 1 // adjust for the leftmost cell
        const newValue = change[0][3]
        if (col >= 0) setAndPatch(row, col, newValue)
      },
      context.$refs.bottomTable.hotInstance
    )
  },
  // hook for when the detail cell is edited (double click or enter)
  // this will trigger the row to be expanded
  addAfterBeginEditing: (context) => {
    const topTable = context.$refs.topTable.hotInstance
    const bottomTable = context.$refs.bottomTable.hotInstance
    const handleEdit = context.handleEdit
    Handsontable.hooks.add(
      'afterBeginEditing',
      (row, column) => {
        handleEdit(row, column, topTable)
      },
      topTable
    )
    Handsontable.hooks.add(
      'afterBeginEditing',
      (row, column) => {
        handleEdit(row, column, bottomTable)
      },
      bottomTable
    )
  },
  // hook for tabbing from the table into the card
  addTableToCard: (context) => {
    const topTable = context.$refs.topTable.hotInstance
    const bottomTable = context.$refs.bottomTable.hotInstance
    const expandedID = context.expandedID

    // array of input boxes from the card
    const inputs = context.$refs.cardview && context.$refs.cardview.$refs.input
    const firstInput = inputs && inputs[0]
    const lastInput = inputs && inputs[inputs.length - 1]

    // handle tabbing from the end of the top table forwards into the top of the card
    Handsontable.hooks.add(
      'afterDocumentKeyDown',
      (e) => {
        if (!topTable.getSelected()) {
          return
        }
        const row = topTable.getSelected()[0][0]
        const col = topTable.getSelected()[0][1]
        const isTopCorner = row == 0 && col == 0
        const isTabForward = e.key == 'Tab' && !e.shiftKey
        if (isTopCorner && isTabForward && expandedID) {
          topTable.deselectCell()
          firstInput.focus()
        }
      },
      topTable
    )
    // handle tabbing from the start of the bottom table backwards into the bottom of the card
    Handsontable.hooks.add(
      'beforeKeyDown',
      (e) => {
        if (!bottomTable.getSelected()) {
          return
        }
        const row = bottomTable.getSelected()[0][0]
        const col = bottomTable.getSelected()[0][1]
        const isTopCorner = row == 0 && col == 0
        const isTabBack = e.key == 'Tab' && e.shiftKey
        if (isTopCorner && isTabBack && expandedID) {
          e.preventDefault()
          bottomTable.deselectCell()
          // delay ensures the focus happens after all keypress events (hacky?)
          setTimeout(() => {
            lastInput.focus()
          }, 0)
        }
      },
      bottomTable
    )
  },
  // hooks for wrapping around from the top to the bottom
  addTableWraparound: (context) => {
    const topTable = context.$refs.topTable.hotInstance
    const bottomTable = context.$refs.bottomTable.hotInstance
    const expandedID = context.expandedID
    // handle tabbing from the start of the top table to the end of the bottom table
    Handsontable.hooks.add(
      'beforeKeyDown',
      (e) => {
        if (!topTable.getSelected()) {
          return
        }
        const row = topTable.getSelected()[0][0]
        const col = topTable.getSelected()[0][1]
        const isTopCorner = row == 0 && col == 0
        const isTabBack = e.key == 'Tab' && e.shiftKey
        if (isTopCorner && isTabBack && expandedID) {
          topTable.deselectCell()
          // delay ensures cell selection happens after all keypress events (hacky?)
          setTimeout(() => {
            bottomTable.selectCell(
              bottomTable.countRows() - 1,
              bottomTable.countCols() - 1
            )
          }, 0)
        }
      },
      topTable
    )
    // handle tabbing from the end of the bottom table to the start of the top table
    Handsontable.hooks.add(
      'afterDocumentKeyDown',
      (e) => {
        if (!bottomTable.getSelected()) {
          return
        }
        const row = bottomTable.getSelected()[0][0]
        const col = bottomTable.getSelected()[0][1]
        const isTopCorner = row == 0 && col == 0
        const isTabForward = e.key == 'Tab' && !e.shiftKey
        if (isTopCorner && isTabForward && expandedID) {
          bottomTable.deselectCell()
          topTable.selectCell(0, 0)
        }
      },
      bottomTable
    )
  },
}
