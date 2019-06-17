<template>
  <div v-if="!globalOptions.mobile" id="table-search">
    <hot-table ref="topTable" :settings="tableSettings"></hot-table>
    <div v-if="expandedID != null">
      <CardView
        :collectionName="collectionName"
        :allColumnNames="allColumnNames"
        :id="expandedID"
        :globalOptions="globalOptions"
        :closeAction="
          () => {
            setExpandedID(null)
          }
        "
        :readOnly="false"
        :previewMode="false"
        :onTabOutUp="onTabOutUp"
        :onTabOutDown="onTabOutDown"
      ></CardView>
    </div>
    <hot-table ref="bottomTable" :settings="tableSettings"></hot-table>
  </div>
  <div v-else>
    <CardSearch
      :collectionNames="[collectionName]"
      :allColumnNames="{
        [collectionName]: allColumnNames,
      }"
      :previewColumnNames="{
        [collectionName]: previewColumnNames,
      }"
      :globalOptions="globalOptions"
      :onClick="() => {}"
      :expandOnClick="true"
    ></CardSearch>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import Handsontable from 'handsontable'
import CardView from './CardView'
import CardSearch from './CardSearch'

export default {
  props: {
    collectionName: String,
    allColumnNames: Array,
    previewColumnNames: Array,
    globalOptions: Object,
    expandedProp: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      // row of the table that will expand to see details
      expandedID: this.expandedProp,
      // common settings for both the top and bottom table (no data)
      tableSettings: {
        colHeaders: [this.globalOptions.detailsTitle].concat(
          this.allColumnNames
        ),
        multiColumnSorting: true,
        manualColumnResize: true,
        selectionMode: 'single',
        licenseKey: 'non-commercial-and-evaluation',
      },
    }
  },
  created() {
    this.populateTables()
  },
  methods: {
    // returns the data for either top or bottom table
    getData(isTop, expandedID) {
      const collection = this.$store.getters['jv/get'](this.collectionName)
      // the order these ids are in will be the order the results are displayed in
      // note: object.keys might be inconsistent
      let ids = Object.keys(collection)

      // for each id in the collection we need to compute the data for the row
      let data = ids.map((id) => {
        // the row items will be determined by the columnNames prop
        const row = this.allColumnNames.map((column) => {
          return collection[id][column]
        })

        // add the expand details cell to the left of each row
        return [this.globalOptions.detailsText].concat(row)
      })

      // using the list of ids find the index of the expanded id
      const halfwayPoint = ids.indexOf(expandedID)

      // start + end points for this table
      const start = isTop ? 0 : halfwayPoint + 1
      const end = isTop ? halfwayPoint : ids.length

      if (halfwayPoint == -1) {
        // if halfwayPoint is -1, nothing is expanded, so show only the top table
        data = isTop ? data : []
        ids = isTop ? ids : []
      } else {
        // if halwayPoint is set, some subset of the whole data is needed for a table
        data = data.slice(start, end)
        ids = ids.slice(start, end)
      }
      // include an array of ids which corresponds to the ids of each row in the data
      // this is needed to keep track of the id of the result for each row
      return {
        data: data,
        ids: ids,
      }
    },
    // add data, meta, and hooks to each table
    populateTables(callback = () => {}) {
      // wait for the next tick when the table is loaded into the DOM
      this.$nextTick(() => {
        // stop if the tables don't exist (for example in mobile view)
        if (!this.$refs.topTable || !this.$refs.bottomTable) {
          return
        }
        const topTableInstance = this.$refs.topTable.hotInstance
        const topTableData = this.getData(true, this.expandedID)
        // add data to the table
        topTableInstance.loadData(topTableData.data)

        // for each details cell on the left, add the meta value for 'id'
        topTableData.ids.forEach((id, index) => {
          topTableInstance.setCellMeta(index, 0, 'id', id)
        })

        // provide custom hook for the cell selection listener in order to differenciate
        // between the top and bottom table (otherwise it will trigger twice)
        Handsontable.hooks.add(
          'afterSelection',
          this.topTableClicked,
          topTableInstance
        )
        // exact same thing for the bottom table
        const bottomTableInstance = this.$refs.bottomTable.hotInstance
        const bottomTableData = this.getData(false, this.expandedID)
        bottomTableInstance.loadData(bottomTableData.data)
        bottomTableData.ids.forEach((id, index) => {
          bottomTableInstance.setCellMeta(index, 0, 'id', id)
        })
        Handsontable.hooks.add(
          'afterSelection',
          this.bottomTableClicked,
          bottomTableInstance
        )

        callback()
      })
    },
    setExpandedID(id, callback = () => {}) {
      this.expandedID = id
      this.populateTables(callback)
    },
    onTabOutUp() {
      const collection = this.$store.getters['jv/get'](this.collectionName)
      const row = Object.keys(collection).indexOf(this.expandedID)
      const rowToSelect = row - 1 < 0 ? row : row - 1
      this.setExpandedID(null, () => {
        // when no row is expanded only the top table shows
        // hacky - the tab keypress happens after the cell is selected in the table
        // here delay the cell selection so it can happen after the keypress
        setTimeout(() => {
          this.$refs.topTable.hotInstance.selectCell(rowToSelect, 1)
        }, 1)
      })
    },
    onTabOutDown() {
      const collection = this.$store.getters['jv/get'](this.collectionName)
      const row = Object.keys(collection).indexOf(this.expandedID)
      this.setExpandedID(null, () => {
        // hacky again, same as onTabOutUp
        setTimeout(() => {
          this.$refs.topTable.hotInstance.selectCell(row, 1)
        }, 1)
      })
    },
    // custom hooks added to the afterSelection listener, with differenciation between tables
    topTableClicked(row, column) {
      this.afterSelection(row, column, this.$refs.topTable.hotInstance)
    },
    bottomTableClicked(row, column) {
      this.afterSelection(row, column, this.$refs.bottomTable.hotInstance)
    },
    afterSelection(row, column, tableInstance) {
      // ignore normal cell selections
      if (column != 0) {
        return
      }
      tableInstance.deselectCell()
      // read the cell meta value for id
      const id = tableInstance.getCellMeta(row, column).id
      this.setExpandedID(id)
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
