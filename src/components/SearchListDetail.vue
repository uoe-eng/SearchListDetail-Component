<template>
  <div id="sld">
    <NavBar
      :collectionNames="Object.keys(this.resultOptions)"
      :selected="page"
    ></NavBar>
    <!-- temporary way to see the mobile version -->
    <label><input type="checkbox" v-model="mobile" /> Mobile version</label>
    <CardSearch
      v-if="page == config.ALL_PAGE_NAME"
      :collections="collections"
      :page="config.ALL_PAGE_NAME"
      :expandedID="expandedIDs[config.ALL_PAGE_NAME]"
      :addOverlay="addOverlay"
      :onClick="expandCard"
      :onClose="closeCard"
      :onSave="saveCard"
      :componentOptions="componentOptions"
    ></CardSearch>
    <TableSearch
      v-else-if="page"
      :collections="collections"
      :type="page"
      :expandedID="expandedIDs[page]"
      :addOverlay="addOverlay"
      :expandCard="expandCard"
      :onCardClose="closeCard"
      :onCardSave="saveCard"
      :componentOptions="componentOptions"
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
      expandedIDs: this.initExpandedIDs(),
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
  methods: {
    setPage(page) {
      this.$store.dispatch('setPage', {
        page: page,
        nextTick: this.$nextTick,
      })
    },
    expandCard(type, id, fromPage) {
      // if on mobile, don't navigate to the page for the card type
      // instead stay on the same page
      const pageToNavTo = this.mobile ? fromPage : type

      // set the expanded ID for the collection type
      this.$set(this.expandedIDs[pageToNavTo], 'id', id)
      this.$set(this.expandedIDs[pageToNavTo], 'type', type)
      this.$delete(this.expandedIDs[pageToNavTo], 'overlay')

      // then switch to that page
      this.$store.dispatch('setPage', {
        page: pageToNavTo,
        nextTick: this.$nextTick,
      })
    },
    closeCard(type, id, fromPage) {
      this.removeOneOverlay(this.expandedIDs[fromPage])
      this.$store.dispatch('refreshPage', this.$nextTick)
    },
    // patch the collection to the server
    saveCard(type, id, fromPage, closeCard = true) {
      if (closeCard) {
        this.closeCard(type, id, fromPage)
      }
      this.patchRecord(type, id)
    },
    addOverlay(expandedID, type, id) {
      if (expandedID.overlay) {
        this.addOverlay(expandedID.overlay, type, id)
      } else {
        this.$set(expandedID, 'overlay', {})
        this.$set(expandedID.overlay, 'type', type)
        this.$set(expandedID.overlay, 'id', id)
      }
    },
    removeOneOverlay(expandedID) {
      if (!expandedID.overlay) {
        this.$set(expandedID, 'type', null)
        this.$set(expandedID, 'id', null)
        return
      }
      if (expandedID.overlay.overlay) {
        this.removeOneOverlay(expandedID.overlay)
      } else {
        this.$delete(expandedID, 'overlay')
      }
    },
    // initialise the structure for the expandedIDs object
    initExpandedIDs() {
      let expandedIDs = {
        [config.ALL_PAGE_NAME]: {},
      }
      const collectionNames = Object.keys(this.resultOptions)
      collectionNames.forEach((name) => {
        expandedIDs[name] = {}
      })
      return expandedIDs
    },
    patchRecord(type, id) {
      const record = this.collections[type].entries[id]
      this.$store.dispatch('jv/patch', record)
    },
  },
  // on creation, fetch the collections from the server
  created() {
    this.$store.registerModule('sld', SldStore)
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
