<template>
  <div id="sld">
    <NavBar
      :collectionNames="Object.keys(this.resultOptions)"
      :setPage="setPage"
      :selected="page"
    ></NavBar>
    <!-- temporary way to see the mobile version -->
    <label><input type="checkbox" v-model="mobile" /> Mobile version</label>
    <CardSearch
      v-if="page == config.ALL_PAGE_NAME"
      :collections="collections"
      :page="config.ALL_PAGE_NAME"
      :expandedID="expandedIDs[config.ALL_PAGE_NAME]"
      :onClick="expandCard"
      :onClose="closeCard"
      :onSave="saveCard"
      :componentOptions="componentOptions"
    ></CardSearch>
    <TableSearch
      v-else-if="page"
      :collection="collections[page]"
      :expandedID="expandedIDs[page]"
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
      page: config.ALL_PAGE_NAME,
      expandedIDs: this.initExpandedIDs(),
      mobile: false,
      // use prop information to create the collections
      // computed after collections are retrieved from the server
      collections: {},
    }
  },
  computed: {
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
      // strange bug ?? need to set to null first, can't go straight to the other page
      this.page = null
      this.$nextTick().then(() => {
        this.page = page
      })
    },
    expandCard(type, id, fromPage) {
      // if on mobile, don't navigate to the page for the card type
      // instead stay on the same page
      const pageToNavTo = this.mobile ? fromPage : type

      // set the expanded ID for the collection type
      this.$set(this.expandedIDs, pageToNavTo, {
        id: id,
        type: type,
      })
      // then switch to that page
      this.setPage(pageToNavTo)
    },
    closeCard(type, id, fromPage) {
      // since the user's click will also trigger expandCard()
      // force this event to happen after (hacky?)
      setTimeout(() => {
        this.expandCard(type, null, fromPage)
      }, 0)
    },
    // patch the collection to the server
    saveCard(type, id, fromPage) {
      this.closeCard(type, id, fromPage)
      alert('save not yet implemented')
    },
    setExpandedID(id, page = this.page) {
      if (id != undefined) {
        this.expandedIDs[page] = id
        this.setPage(page)
      }
    },
    // initialise the structure for the expandedIDs object
    initExpandedIDs() {
      let expandedIDs = {
        [config.ALL_PAGE_NAME]: {
          id: null,
          type: null,
        },
      }
      const collectionNames = Object.keys(this.resultOptions)
      collectionNames.forEach((name) => {
        expandedIDs[name] = {
          id: null,
          type: null,
        }
      })
      return expandedIDs
    },
  },
  // on creation, fetch the collections from the server
  created() {
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
  background-color: #fff;
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
