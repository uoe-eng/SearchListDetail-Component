import Handsontable from 'handsontable'

export default {
  // hook for when the detail cell is edited (double click or enter)
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
  // hook for moving from the table onto the card
  addTableToCard: (context) => {
    const topTable = context.$refs.topTable.hotInstance
    const bottomTable = context.$refs.bottomTable.hotInstance
    const expandedID = context.expandedID

    const inputs = context.$refs.cardview && context.$refs.cardview.$refs.input
    const firstInput = inputs && inputs[0]
    const lastInput = inputs && inputs[inputs.length - 1]

    // top table at end, going forward
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
    // bottom table at 0,0 going back
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
    // hooks to deal with jumping into a detail using tab keypresses
    // top table at 0,0 going back
    Handsontable.hooks.add(
      'beforeKeyDown',
      (e) => {
        if (!topTable.getSelected()) {
          return
        }
        // console.log(context.rowNumberFromID(expandedID));

        const row = topTable.getSelected()[0][0]
        const col = topTable.getSelected()[0][1]
        const isTopCorner = row == 0 && col == 0
        const isTabBack = e.key == 'Tab' && e.shiftKey
        if (isTopCorner && isTabBack && expandedID) {
          topTable.deselectCell()
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
    // bottom table at last cell going forward
    // -> loop to the top table
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
