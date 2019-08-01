<template>
  <div id="sld">
    <SearchBox :localstore="localstore" ref="searchbox"></SearchBox>
    <AdvancedSearch
      v-if="page"
      :localstore="localstore"
      ref="advsearch"
    ></AdvancedSearch>
    <span v-if="localstore.state.pendingRequests > 0">searching...</span>
    <NavBar
      v-if="search != ''"
      :displayResultCount="options.countResults"
      :localstore="localstore"
      ref="navbar"
    ></NavBar>
    <label v-if="search">
      <input type="checkbox" @click="toggleMobile" />
      Mobile version
    </label>
    <CardSearch
      v-if="page == config.ALL_PAGE_NAME && search"
      :localstore="localstore"
      ref="cardsearch"
    ></CardSearch>
    <TableSearch
      v-else-if="page && search"
      :type="page"
      :localstore="localstore"
      ref="tablesearch"
    ></TableSearch>
  </div>
</template>

<script>
import Vue from 'vue'
import TableSearch from './TableSearch'
import CardSearch from './CardSearch'
import NavBar from './NavBar'
import config from './config'
import Collection from './Collection'
import SldStore from './SldStore'
import SearchBox from './SearchBox'
import AdvancedSearch from './AdvancedSearch'
import ExpansionState from './ExpansionState'

export default {
  name: 'SearchListDetail',
  props: {
    options: Object,
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
  },
  // on creation, fetch the collections from the server
  created() {
    Vue.set(this.localstore.state, 'nextTick', this.$nextTick)
    Vue.set(this.localstore.state, 'sldProp', this.options)
    Vue.set(this.localstore.state, 'globalstore', this.$store)

    const collections = this.options.collections.map((collectionOptions) => {
      const collection = new Collection(
        collectionOptions,
        this.localstore,
        this.$store
      )

      // console.debug('getting', url, 'from server...')
      // this.$store.dispatch('jv/get', collectionOptions.name).then(() => {
      //   // console.debug('finished getting', collectionOptions.name)
      //   this.localstore.dispatch('updateSearchResults')
      // })

      return collection
    })
    Vue.set(this.localstore.state, 'collections', collections)

    Vue.set(
      this.localstore.state,
      'expansionState',
      // argument is an array of the column names
      new ExpansionState(this.options.collections.map((c) => c.name))
    )
  },
  methods: {
    toggleMobile() {
      Vue.set(this.localstore.state, 'mobile', !this.localstore.state.mobile)
      this.$forceUpdate()
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
