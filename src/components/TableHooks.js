import Handsontable from 'handsontable'

export default {
  // when a cell is edited, the value is updated in the reactive object
  addAfterChange: (context) => {
    Handsontable.hooks.add(
      'afterChange',
      (change) => {
        const row = change[0][0]
        const col = change[0][1] - 1 // adjust for the leftmost cell
        const newValue = change[0][3]
        if (col >= 0) {
          const id = context.collection.fromCoordinates(row, col).id
          const colName = context.collection.fromCoordinates(row, col).col
          context.$set(context.collection.entries[id], colName, newValue)
        }
      },
      context.$refs.topTable.hotInstance
    )

    Handsontable.hooks.add(
      'afterChange',
      (change) => {
        // will always be found since the bottom table only shows when a row is expanded
        const expandedRow = context.collection
          .ids()
          .indexOf(context.expandedID.id)
        // row 0 would just be the row just under the card which is not what we want
        const row = change[0][0] + expandedRow + 1
        const col = change[0][1] - 1 // adjust for the leftmost cell
        const newValue = change[0][3]
        if (col >= 0) {
          const id = context.collection.fromCoordinates(row, col).id
          const colName = context.collection.fromCoordinates(row, col).col
          context.$set(context.collection.entries[id], colName, newValue)
        }
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
