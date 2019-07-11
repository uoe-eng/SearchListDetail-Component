<template>
  <div id="sld">
    <SearchBox></SearchBox>
    <AdvancedSearch v-if="page"></AdvancedSearch>
    <NavBar v-if="search != ''" :displayResultCount="countResults"></NavBar>
    <label v-if="search">
      <input type="checkbox" @click="$store.dispatch('toggleMobile')" />
      Mobile version
    </label>
    <CardSearch v-if="page == config.ALL_PAGE_NAME && search"></CardSearch>
    <TableSearch v-else-if="page && search" :type="page"></TableSearch>
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
    }
  },
  computed: {
    expanded() {
      return this.$store.state.sld.allExpanded[this.page]
    },
    page() {
      return this.$store.state.sld.page
    },
    search() {
      return this.$store.state.sld.search
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
    this.$store.registerModule('sld', SldStore)
    this.$store.commit('setResultOptions', this.resultOptions)
    this.$store.commit('initialiseExpanded')
    this.$store.commit('defineNextTick', this.$nextTick)
    this.$store.commit('setComponentOptions', this.componentOptions)
    this.$store.commit('initialiseSearchOptions')
    const collectionNames = Object.keys(this.resultOptions)
    // for each collection
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
          this.columnOptions(collectionName)
        )
        // save collection class to store
        this.$store.dispatch('setCollectionDescriptor', collectionDescriptor)
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
