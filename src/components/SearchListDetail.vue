<template>
  <div id="sld">
    <NavBar
      :collections="collectionNames"
      :setView="setView"
      :selected="view"
    ></NavBar>
    <div id="nav-bar-spacer"></div>
    <label><input type="checkbox" v-model="mobile" /> Mobile version</label>
    <CardSearch
      v-if="view == 'All'"
      :collectionNames="selectedCollections"
      :allColumnNames="allColumnNames"
      :previewColumnNames="previewColumnNames"
      :options="options"
      :onClick="mobile ? ()=>{} : setView"
      :expandOnClick="mobile"
    ></CardSearch>
    <TableSearch
      v-else
      :collectionName="view"
      :allColumnNames="allColumnNames[view]"
      :previewColumnNames="previewColumnNames[view]"
      :options="options"
      :expandedProp="expandedID"
    ></TableSearch>
  </div>
</template>

<script>
import TableSearch from './TableSearch'
import CardSearch from './CardSearch'
import NavBar from './NavBar'

export default {
  name: 'SearchListDetail',
  props: {
    collectionNames: Array,
    // shown when details are expanded
    allColumnNames: Object,
    // shown in a card when not expanded
    previewColumnNames: Object,
    // extra configuration options
    firstAttrAsCardTitle: {
      type: Boolean,
      default: true,
    },
    detailsTitle: {
      type: String,
      default: 'details',
    },
    detailsText: {
      type: String,
      default: '+',
    },
  },
  components: {
    NavBar,
    CardSearch,
    TableSearch,
  },
  data: () => {
    return {
      view: 'All',
      expandedID: null,
      mobile: false,
      searchResult: {},
      delWidgetId: undefined,
      postWidget: {
        _jv: {
          type: 'widget',
        },
      },
    }
  },
  computed: {
    // group together all options to pass around in other components as a single prop
    options() {
      return {
        firstAttrAsCardTitle: this.firstAttrAsCardTitle,
        detailsTitle: this.detailsTitle,
        detailsText: this.detailsText,
        mobile: this.mobile,
      }
    },
    sessions() {
      return this.$store.state.jv._jv
    },
    selectedCollections() {
      if (this.view == 'All') {
        return this.collectionNames
      } else {
        return [this.view]
      }
    },
  },
  methods: {
    setView: function(view, expandedID) {
      // really strange bug ?? can't go straight to the other view
      this.view = 'All'
      this.expandedID = expandedID
      this.$nextTick().then(() => {
        this.view = view
      })
    },
  },
  created() {
    this.collectionNames.forEach((collectionName) => {
      this.$store.dispatch('jv/get', collectionName)
      this.$store.dispatch('jv/search', collectionName).then((res) => {
        this.searchResult[collectionName] = res
      })
    })
  },
}
</script>

<style scoped>
#nav-bar-spacer {
  height: 80px;
}
</style>
