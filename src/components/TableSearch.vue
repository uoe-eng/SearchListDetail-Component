<template>
  <div v-if="!componentOptions.mobile" id="table-search">
    <hot-table ref="topTable" :settings="tableSettings"></hot-table>
    <div v-if="expanded && expanded.id != null">
      <CardView
        :type="type"
        :id="expanded.id"
        :expanded="expanded"
        :isReadOnly="false"
        :isExpanded="true"
        :onTabOutUp="onTabOutUp"
        :onTabOutDown="onTabOutDown"
        ref="cardview"
      ></CardView>
    </div>
    <hot-table ref="bottomTable" :settings="tableSettings"></hot-table>
  </div>
  <CardSearch v-else :collections="collections" :showOnly="type"></CardSearch>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import CardView from './CardView'
import CardSearch from './CardSearch'
import TableHooks from './TableHooks'

export default {
  props: {
    type: String,
  },
  computed: {
    collections() {
      return this.$store.state.sld.collections
    },
    collection() {
      return this.collections[this.type]
    },
    expanded() {
      return this.$store.state.sld.allExpanded[this.page]
    },
    page() {
      return this.$store.state.sld.page
    },
    // data for the tables calculated from the collection and expanded id
    tableData() {
      return this.collection.splitIntoTables(
        this.expanded,
        this.componentOptions.detailsText
      )
    },
    componentOptions() {
      return this.$store.state.sld.componentOptions
    },
    // common settings for both the top and bottom table (no data)
    tableSettings() {
      return {
        colHeaders: [this.componentOptions.detailsTitle].concat(
          this.collections[this.type].fullCols
        ),
        columnSorting: true,
        // manualColumnResize: true,
        selectionMode: 'single',
        // stretchH: 'all',
        licenseKey: 'non-commercial-and-evaluation',
      }
    },
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
        topTableInstance
          .getPlugin('columnSorting')
          .sort(this.collection.columnSorting)
        bottomTableInstance
          .getPlugin('columnSorting')
          .sort(this.collection.columnSorting)

        // add the hooks to the tables
        TableHooks.addAfterChange(this)
        TableHooks.addAfterBeginEditing(this)
        TableHooks.addTableToCard(this)
        TableHooks.addTableWraparound(this)
        TableHooks.afterColumnSort(this)
      })
    },
    // handles when the details cell is edited, expands the card
    handleEdit(row, column, tableInstance) {
      // ignore normal cell selections
      if (column != 0) return
      // read the cell meta value for id
      const id = tableInstance.getCellMeta(row, column).id
      // this.expandCard(this.collection.type, id, this.collection.type)
      this.$store.dispatch('setExpanded', {
        page: this.type,
        type: this.type,
        id: id,
      })
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
