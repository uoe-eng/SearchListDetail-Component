import Vue from 'vue'
import Vuex from 'vuex'
import config from './config'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    page: config.ALL_PAGE_NAME,
    collections: [],
    getCollection: function(name) {
      const collectionNames = this.collections.map((c) => c.name)
      return this.collections[collectionNames.indexOf(name)]
    },
    search: '',
    expandedAdvancedSearch: false,
    sldProp: {},
  },
  mutations: {
    setPage(state, page) {
      Vue.set(state, 'page', page)
    },
    updateSearchResults(state) {
      // for each collection, filter the results from the store and put them into
      // the .searchResults attribute
      state.collections.forEach((collection) => {
        const results = collection.filter(state.search)
        Vue.set(collection, 'searchResults', state.search ? results : {})
      })
    },
  },
  actions: {
    updateSearchResults(context) {
      config.log('updating search results')
      context.commit('updateSearchResults')
    },
    setPage(context, page) {
      config.log('setting page', page)
      context.commit('setPage', null)
      context.state.nextTick(() => {
        context.commit('setPage', page)
      })
    },
  },
})
