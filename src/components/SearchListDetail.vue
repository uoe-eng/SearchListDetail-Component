<template>
  <div id="sld">
    <NavBar :collectionNames="Object.keys(this.resultOptions)"></NavBar>
    <!-- temporary way to see the mobile version -->
    <label><input type="checkbox" v-model="mobile" /> Mobile version</label>
    <CardSearch
      v-if="page == config.ALL_PAGE_NAME"
      :collections="collections"
    ></CardSearch>
    <TableSearch
      v-else-if="page"
      :collections="collections"
      :type="page"
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
  },
  components: {
    NavBar,
    CardSearch,
    TableSearch,
  },
  data() {
    return {
      config: config,
      mobile: false,
      // use prop information to create the collections
      // computed after collections are retrieved from the server
      collections: {},
    }
  },
  computed: {
    page() {
      return this.$store.state.sld.page
    },
    // group together all options to pass around in other components as a single prop
    componentOptions() {
      return {
        firstAttrAsCardTitle: this.firstAttrAsCardTitle,
        detailsTitle: this.detailsTitle,
        detailsText: this.detailsText,
        mobile: this.mobile,
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
          (column) => {
            return column.name
          }
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
          ].columns.map((column) => {
            return column.name
          })
        }
      })
      return names
    },
  },
  // on creation, fetch the collections from the server
  created() {
    this.$store.registerModule('sld', SldStore)
    this.$store.commit('initialiseExpanded', this.resultOptions)
    this.$store.commit('defineNextTick', this.$nextTick)
    this.$store.commit('setComponentOptions', this.componentOptions)
    const collectionNames = Object.keys(this.resultOptions)
    // for each collection
    collectionNames.forEach((collectionName) => {
      // get collection from server
      // sparse fields not working?
      const url = `${collectionName}`
      this.$store.dispatch('jv/get', url).then(() => {
        // create a reactive object from the collection in the store
        let collection = new Collection(
          collectionName,
          this.$store.getters['jv/get'](collectionName),
          this.fullColumnNames[collectionName],
          this.previewColumnNames[collectionName]
        )
        // this.$store.dispatch('addCollection', collection)
        this.$set(this.collections, collectionName, collection)
      })
    })
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
  grid-template-areas: 'nav' 'settings' 'results';
  /* collapses first two as much as possible */
  grid-template-rows: auto auto 1fr;
  /* change this depending on application */
  height: 100vh;
}

.hidden {
  display: none;
}
</style>
