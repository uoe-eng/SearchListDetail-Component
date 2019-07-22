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
    toggleAllCheckboxes(state, collectionName) {
      const columns = state.collections[collectionName].options.columns
      const currentState = columns[0].searchable
      console.log('toggling all to', !currentState)
      columns.forEach((column) => {
        Vue.set(column, 'searchable', !currentState)
      })
    },
    setComponentOptions(state, options) {
      Vue.set(state, 'componentOptions', options)
    },
    setPage(state, page) {
      Vue.set(state, 'page', page)
    },
    toggleMobile(state) {
      Vue.set(state.componentOptions, 'mobile', !state.componentOptions.mobile)
    },
    setSearch(state, search) {
      console.log('setting search to', search)
      Vue.set(state, 'search', search)
    },
    updateSerachResults(state) {
      // for each collection, filter the results from the store and put them into
      // the .searchResults attribute
      state.collections.forEach((collection) => {
        const results = collection.filter(state.search)
        Vue.set(collection, 'searchResults', state.search ? results : {})
      })
    },
  },
  actions: {
    updateSerachResults(context) {
      context.commit('updateSerachResults')
    },
    setPage(context, page) {
      console.log('setting page', page)
      context.commit('setPage', null)
      context.state.nextTick(() => {
        context.commit('setPage', page)
      })
    },
    setExpanded(context, args) {
      context.commit('setExpanded', args)
    },
    setCollectionDescriptor(context, collection) {
      context.commit('setCollectionDescriptor', collection)
      context.commit('updateSerachResults')
    },
    updateEntries(context, args) {
      context.commit('updateEntries', args)
    },
    addOverlay(context, args) {
      context.commit('addOverlay', args)
    },
    removeOneOverlay(context) {
      context.commit('removeOneOverlay')
    },
    toggleMobile(context) {
      context.commit('toggleMobile')
    },
    search(context, search) {
      context.commit('setSearch', search)
      context.commit('updateSerachResults')
    },
    toggleCheckBox(context, args) {
      context.commit('toggleCheckBox', args)
      context.commit('updateSerachResults')
    },
    toggleAllCheckboxes(context, collectionName) {
      context.commit('toggleAllCheckboxes', collectionName)
      context.commit('updateSerachResults')
    },
  },
})
