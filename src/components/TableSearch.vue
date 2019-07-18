<template>
  <div v-if="!componentOptions.mobile" id="table-search">
    <hot-table ref="topTable" :settings="tableSettings"></hot-table>
    <div v-if="expanded && expanded.id != null">
      <CardView
        :localstore="localstore"
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
  <CardSearch
    v-else
    :collections="collections"
    :showOnly="type"
    :localstore="localstore"
  ></CardSearch>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import CardView from './CardView'
import CardSearch from './CardSearch'
import TableHooks from './TableHooks'

export default {
  props: {
    localstore: Object,
    type: String,
  },
  computed: {
    collections() {
      return this.localstore.state.collections
    },
    collection() {
      return this.collections[this.type]
    },
    expanded() {
      return this.localstore.state.allExpanded[this.page]
    },
    page() {
      return this.localstore.state.page
    },
    // data for the tables calculated from the collection and expanded id
    tableData() {
      return this.collection.splitIntoTables(
        this.expanded,
        this.componentOptions.detailsText
      )
    },
    componentOptions() {
      return this.localstore.state.componentOptions
    },
    // common settings for both the top and bottom table (no data)
    tableSettings() {
      return {
        colHeaders: this.colHeaders,
        columnSorting: true,
        // manualColumnResize: true,
        selectionMode: 'single',
        // stretchH: 'all',
        licenseKey: 'non-commercial-and-evaluation',
      }
    },
    // returns an array of all headers to be show in handsontable
    colHeaders() {
      return [this.componentOptions.detailsTitle]
        .concat(this.collection.fullCols)
        .map((header, index) => {
          // skip first header
          if (index == 0) return header
          // otherwise get the alias for that header
          return this.collection.getAlias(header)
        })
    },
  },
  created() {
    this.populateTables()
    this.addHooks()
  },
  updated() {
    this.populateTables()
    this.$refs.topTable.hotInstance.render()
    this.$refs.bottomTable.hotInstance.render()
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
      console.log('populating tables...')
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
      })
    },

    // add the hooks to the tables
    addHooks() {
      this.$nextTick(() => {
        // stop if the tables don't exist (for example in mobile view)
        if (!this.$refs.topTable || !this.$refs.bottomTable) {
          return
        }
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
      this.localstore.dispatch('setExpanded', {
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
