<template>
  <div id="sld">
    <NavBar
      :collections="collectionNames"
      :setView="setView"
      :selected="view"
    ></NavBar>
    <div id="nav-bar-spacer"></div>
    <CardSearch
      v-if="view == 'All'"
      :collectionNames="selectedCollections"
      :columnNames="columnNames"
      :options="options"
      :setView="setView"
    ></CardSearch>
    <TableSearch
      v-else
      :collectionName="view"
      :columnNames="columnNames[view]"
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
    columnNames: Object,
    options: Object,
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
      // really strange bug ??
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
