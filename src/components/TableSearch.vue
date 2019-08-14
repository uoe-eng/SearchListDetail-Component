<template>
  <div v-if="!localstore.state.mobile" id="table-search">
    <hot-table ref="topTable" :settings="tableSettings"></hot-table>
    <CardView
      v-if="expanded && expanded.id != null"
      :localstore="localstore"
      :type="type"
      :id="expanded.id"
      :expanded="expanded"
      :isReadOnly="false"
      :isExpanded="true"
      ref="cardview"
      class="expanded-card"
    ></CardView>
    <hot-table ref="bottomTable" :settings="tableSettings"></hot-table>
  </div>
  <CardSearch
    v-else
    :collections="collections"
    :showOnly="type"
    :localstore="localstore"
    ref="cardsearch"
    class="cardsearch"
  ></CardSearch>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import CardView from './CardView'
import CardSearch from './CardSearch'
import addTableHooks from './addTableHooks'
import util from './util'
import config from './config'

export default {
  props: {
    localstore: Object,
    type: String,
  },
  computed: {
    searchTerm() {
      return this.localstore.state.search
    },
    collections() {
      return this.localstore.state.collections
    },
    collection() {
      return util.getCollection(this.localstore, this.type)
    },
    expanded() {
      return this.localstore.state.expansionState[this.page]
    },
    page() {
      return this.localstore.state.page
    },
    // data for the tables calculated from the collection and expanded id
    tableData() {
      return util.getSplitTableData(
        this.$store,
        this.expanded.id,
        this.collection
      )
    },
    sldProp() {
      return this.localstore.state.sldProp
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
      return [config.DETAILS_TITLE].concat(
        this.collection.columnNames.map((header) => {
          // otherwise get the alias for that header
          return util.getColumnAlias(this.collection, header)
        })
      )
    },
  },
  created() {
    this.localstore.state.populateTables = () => this.populateTables()
    this.populateTables()
    this.addHooks()
  },
  updated() {
    this.populateTables()
    // this.$refs.topTable.hotInstance.render()
    // this.$refs.bottomTable.hotInstance.render()
  },
  methods: {
    // add data, meta, and hooks to each table
    populateTables() {
      util.log('populating tables...')
      // wait for the next tick when the table is loaded into the DOM
      this.$nextTick(() => {
        // stop if the tables don't exist (for example in mobile view)
        if (
          !this.$refs.topTable ||
          !this.$refs.topTable.hotInstance ||
          !this.$refs.bottomTable ||
          !this.$refs.bottomTable.hotInstance
        )
          return

        // get the top table instance
        const topTableInstance = this.$refs.topTable.hotInstance
        // add top data to the table
        topTableInstance.loadData(this.tableData.top)
        // for each details cell on the left, add the meta value for 'id'
        this.tableData.topIDs.forEach((id, index) => {
          topTableInstance.setCellMeta(index, 0, 'id', id)
        })
        // save the instance to the store so it can be used by other components
        // (like when focusing from a card tab out)
        this.localstore.state.topTableInstance = topTableInstance

        // exact same thing for the bottom table
        const bottomTableInstance = this.$refs.bottomTable.hotInstance
        bottomTableInstance.loadData(this.tableData.bottom)
        this.tableData.bottomIDs.forEach((id, index) => {
          bottomTableInstance.setCellMeta(index, 0, 'id', id)
        })
        this.localstore.state.bottomTableInstance = bottomTableInstance

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
        addTableHooks(this)
      })
    },

    // handles when the details cell is edited, expands the card
    handleEdit(row, column, tableInstance) {
      // ignore normal cell selections
      if (column != 0) return
      // read the cell meta value for id
      const id = tableInstance.getCellMeta(row, column).id
      // this.expandCard(this.collection.type, id, this.collection.type)
      this.localstore.state.expansionState.setExpanded(this.type, this.type, id)
      setTimeout(() => {
        const firstInput = () => {
          const cardview = this.$refs.cardview
          const inputs = cardview && cardview.$refs.input
          return inputs && inputs[0]
        }
        firstInput().focus()
      }, 0)
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
