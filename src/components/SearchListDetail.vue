<template>
  <div id="sld">
    <NavBar
      :collections="collectionNames"
      :setView="setView"
      :selected="view"
    ></NavBar>
    <div id="nav-bar-spacer"></div>
    <!-- temporary way to see the mobile version -->
    <label><input type="checkbox" v-model="mobile" /> Mobile version</label>
    <CardSearch
      v-if="view == 'All'"
      :collectionNames="selectedCollections"
      :allColumnNames="allColumnNames"
      :previewColumnNames="previewColumnNames"
      :globalOptions="globalOptions"
      :onClick="mobile ? () => {} : setView"
      :expandOnClick="mobile"
    ></CardSearch>
    <TableSearch
      v-else
      :collectionName="view"
      :allColumnNames="allColumnNames[view]"
      :previewColumnNames="previewColumnNames[view]"
      :globalOptions="globalOptions"
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
    }
  },
  computed: {
    // group together all options to pass around in other components as a single prop
    globalOptions() {
      return {
        firstAttrAsCardTitle: this.firstAttrAsCardTitle,
        detailsTitle: this.detailsTitle,
        detailsText: this.detailsText,
        mobile: this.mobile,
      }
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
    })
  },
}
</script>

<style scoped>
#nav-bar-spacer {
  height: 80px;
}
</style>
