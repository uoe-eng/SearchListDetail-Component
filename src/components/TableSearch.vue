<template>
  <div v-if="!componentOptions.mobile" id="table-search">
    <hot-table ref="topTable" :settings="tableSettings"></hot-table>
    <div v-if="expandedID.id != null">
      <CardView
        :collection="collection"
        :id="expandedID.id"
        :componentOptions="componentOptions"
        :onClose="onCardClose"
        :onSave="onCardSave"
        :isReadOnly="false"
        :isExpanded="true"
        :onTabOutUp="onTabOutUp"
        :onTabOutDown="onTabOutDown"
        ref="cardview"
      ></CardView>
    </div>
    <hot-table ref="bottomTable" :settings="tableSettings"></hot-table>
  </div>
  <CardSearch
    v-else
    :collections="{
      [collection.type]: collection,
    }"
    :page="collection.type"
    :expandedID="expandedID"
    :onClick="expandCard"
    :onClose="onCardClose"
    :onSave="onCardSave"
    :componentOptions="componentOptions"
  ></CardSearch>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import CardView from './CardView'
import CardSearch from './CardSearch'
import TableHooks from './TableHooks'

export default {
  props: {
    collection: Object,
    expandedID: Object,
    expandCard: Function,
    onCardClose: Function,
    onCardSave: Function,
    componentOptions: Object,
  },
  data() {
    return {
      // common settings for both the top and bottom table (no data)
      tableSettings: {
        colHeaders: [this.componentOptions.detailsTitle].concat(
          this.collection.fullCols
        ),
        columnSorting: true,
        // manualColumnResize: true,
        selectionMode: 'single',
        // stretchH: 'all',
        licenseKey: 'non-commercial-and-evaluation',
      },
      // data for the tables calculated from the collection and expanded id
      tableData: this.collection.splitIntoTables(
        this.expandedID,
        this.componentOptions.detailsText
      ),
    }
  },
  created() {
    this.populateTables()
  },
  methods: {
    // select the end of the top table
    onTabOutUp() {
      setTimeout(() => {
        const topTable = this.$refs.topTable.hotInstance
        topTable.selectCell(topTable.countRows() - 1, topTable.countCols() - 1)
      }, 0)
    },
    // select the start of the bottom table
    onTabOutDown() {
      setTimeout(() => {
        this.$refs.bottomTable.hotInstance.selectCell(0, 0)
      }, 0)
    },
    // add data, meta, and hooks to each table
    populateTables() {
      // wait for the next tick when the table is loaded into the DOM
      this.$nextTick(() => {
        // stop if the tables don't exist (for example in mobile view)
        if (!this.$refs.topTable || !this.$refs.bottomTable) {
          return
        }

        // get the top table instance
        const topTableInstance = this.$refs.topTable.hotInstance
        // add top data to the table
        topTableInstance.loadData(this.tableData.top)
        // for each details cell on the left, add the meta value for 'id'
        this.tableData.topIDs.forEach((id, index) => {
          topTableInstance.setCellMeta(index, 0, 'id', id)
        })

        // exact same thing for the bottom table
        const bottomTableInstance = this.$refs.bottomTable.hotInstance
        bottomTableInstance.loadData(this.tableData.bottom)
        this.tableData.bottomIDs.forEach((id, index) => {
          bottomTableInstance.setCellMeta(index, 0, 'id', id)
        })

        // sort the tables by the current sorting order
        topTableInstance.getPlugin('columnSorting').sort(
          this.collection.columnSorting
        )
        bottomTableInstance.getPlugin('columnSorting').sort(
          this.collection.columnSorting
        )

        // add the hooks to the tables
        TableHooks.addAfterChange(this)
        TableHooks.addAfterBeginEditing(this)
        TableHooks.addTableToCard(this)
        TableHooks.addTableWraparound(this)
        TableHooks.afterColumnSort(this)
      })
    },
    handleEdit(row, column, tableInstance) {
      // ignore normal cell selections
      if (column != 0) {
        return
      }
      tableInstance.deselectCell()
      // read the cell meta value for id
      const id = tableInstance.getCellMeta(row, column).id
      this.expandCard(this.collection.type, id, this.collection.type)
    },
  },
  components: {
    HotTable,
    CardView,
    CardSearch,
  },
}
</script>

<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
