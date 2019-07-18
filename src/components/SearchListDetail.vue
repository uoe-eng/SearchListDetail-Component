<template>
  <div id="sld">
    <SearchBox :localstore="localstore"></SearchBox>
    <AdvancedSearch v-if="page" :localstore="localstore"></AdvancedSearch>
    <NavBar
      v-if="search != ''"
      :displayResultCount="countResults"
      :localstore="localstore"
    ></NavBar>
    <label v-if="search">
      <input type="checkbox" @click="localstore.dispatch('toggleMobile')" />
      Mobile version
    </label>
    <CardSearch
      v-if="page == config.ALL_PAGE_NAME && search"
      :localstore="localstore"
    ></CardSearch>
    <TableSearch
      v-else-if="page && search"
      :type="page"
      :localstore="localstore"
    ></TableSearch>
  </div>
</template>

<script>
import TableSearch from './TableSearch'
import CardSearch from './CardSearch'
import NavBar from './NavBar'
import config from './config'
import Collection from './Collection'
import SldStore from './SldStore'
import SearchBox from './SearchBox'
import AdvancedSearch from './AdvancedSearch'

export default {
  name: 'SearchListDetail',
  props: {
    resultOptions: Object,
    // extra configuration options
    firstAttrAsCardTitle: {
      type: Boolean,
      default: true,
    },
    detailsTitle: {
      type: String,
      default: config.DEFAULT_DETAILS_TITLE,
    },
    detailsText: {
      type: String,
      default: config.DEFAULT_DETAILS_TEXT,
    },
    countResults: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    NavBar,
    CardSearch,
    TableSearch,
    SearchBox,
    AdvancedSearch,
  },
  data() {
    return {
      config: config,
      mobile: false,
      // each instance of an SLD has it's own locally scoped store object
      localstore: SldStore,
    }
  },
  computed: {
    expanded() {
      return this.localstore.state.allExpanded[this.page]
    },
    page() {
      return this.localstore.state.page
    },
    search() {
      return this.localstore.state.search
    },
    // group together all options to pass around in other components as a single prop
    componentOptions() {
      return {
        firstAttrAsCardTitle: this.firstAttrAsCardTitle,
        detailsTitle: this.detailsTitle,
        detailsText: this.detailsText,
        countResults: this.countResults,
        mobile: false,
      }
    },
    // the collections that will be shown
    // if it's the "all" page, return all collections, otherwise just return one
    selectedCollections() {
      if (this.page == config.ALL_PAGE_NAME) {
        // all collection names
        return Object.keys(this.resultOptions)
      } else {
        return [this.page]
      }
    },
    // column names that are shown in the table and expanded card view
    fullColumnNames() {
      let names = {}
      const collectionNames = Object.keys(this.resultOptions)
      collectionNames.forEach((collectionName) => {
        // array of column names, each column in a collection has a name
        names[collectionName] = this.resultOptions[collectionName].columns.map(
          (column) => column.name
        )
      })
      return names
    },
    // column names that are shown in the collapsed card view
    previewColumnNames() {
      let names = {}
      const collectionNames = Object.keys(this.resultOptions)
      collectionNames.forEach((collectionName) => {
        const previewColumns = this.resultOptions[collectionName].previewOrder
        if (previewColumns) {
          names[collectionName] = previewColumns
        } else {
          names[collectionName] = this.resultOptions[
            collectionName
          ].columns.map((column) => column.name)
        }
      })
      return names
    },
  },
  // on creation, fetch the collections from the server
  created() {
    this.localstore.commit('setResultOptions', this.resultOptions)
    this.localstore.commit('initialiseExpanded')
    this.localstore.commit('defineNextTick', this.$nextTick)
    this.localstore.commit('setComponentOptions', this.componentOptions)
    this.localstore.commit('initialiseSearchOptions')

    // for each collection
    const collectionNames = Object.keys(this.resultOptions)
    collectionNames.forEach((collectionName) => {
      // get collection from server
      // sparse fields not working?
      const url = `${collectionName}`
      console.log('getting', url, 'from server...')

      this.$store.dispatch('jv/get', url).then(() => {
        let collectionDescriptor = new Collection(
          collectionName,
          this.fullColumnNames[collectionName],
          this.previewColumnNames[collectionName],
          this.columnOptions(collectionName),
          this.localstore,
          this.$store
        )
        // save collection class to store
        this.localstore.dispatch(
          'setCollectionDescriptor',
          collectionDescriptor
        )
      })
    })
  },
  methods: {
    columnOptions(collectionName) {
      const columnOptions = {}
      this.resultOptions[collectionName].columns.forEach((column) => {
        columnOptions[column.name] = {
          caseSensitive: column.caseSensitive || config.DEFAULT_CASE_SENSITIVE,
          searchOperator:
            column.searchOperator || config.DEFAULT_SEARCH_OPERATOR,
        }
      })
      return columnOptions
    },
  },
}
</script>

<style scoped>
#sld {
  --card-width: 500px;
  --highlight-color: rgba(0, 0, 0, 0.03);
  --text-color: black;
  --alt-text-color: grey;
  --light-card: white;
  color: var(--text-color);
  background-color: white;
  display: grid;
  grid-template-areas: 'search' 'advanced' 'nav' 'settings' 'results';
  /* collapses first three as much as possible */
  grid-template-rows: auto auto auto auto 1fr;
  /* change this depending on application */
  height: 100vh;
}

.hidden {
  display: none;
}
</style>
