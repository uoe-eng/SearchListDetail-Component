import Vue from 'vue'
import Vuex from 'vuex'
import config from './config'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    page: config.ALL_PAGE_NAME,
    collections: {},
    componentOptions: {},
    search: '',
    searchOptions: {},
    expandedAdvancedSearch: false,
    sldProp: {},
  },
  mutations: {
    // called on creation so it can be used in the future
    defineNextTick(state, nextTick) {
      Vue.set(state, 'nextTick', nextTick)
    },
    // called on creation to define the data structure for allExpanded
    initialiseExpanded(state) {
      let allExpanded = {
        [config.ALL_PAGE_NAME]: {},
      }
      const collectionNames = Object.keys(state.resultOptions)
      collectionNames.forEach((name) => {
        allExpanded[name] = {}
      })
      Vue.set(state, 'allExpanded', allExpanded)
    },
    initialiseSearchOptions(state) {
      const collectionNames = Object.keys(state.resultOptions)
      collectionNames.forEach((collectionName) => {
        state.searchOptions[collectionName] = {}
        const columns = state.resultOptions[collectionName].columns
        columns.forEach((column) => {
          Vue.set(state.searchOptions[collectionName], column.name, true)
        })
      })
    },
    setResultOptions(state, resultOptions) {
      Vue.set(state, 'resultOptions', resultOptions)
    },
    toggleCheckBox(state, args) {
      const type = args.type
      const column = args.column
      Vue.set(
        state.searchOptions[type],
        column,
        !state.searchOptions[type][column]
      )
    },
    toggleAllCheckboxes(state, collectionName) {
      const columns = state.collections[collectionName].fullCols
      const currentState = state.searchOptions[collectionName][columns[0]]
      console.log('toggling all to', !currentState)
      columns.forEach((column) => {
        Vue.set(state.searchOptions[collectionName], column, !currentState)
      })
    },
    setComponentOptions(state, options) {
      Vue.set(state, 'componentOptions', options)
    },
    setPage(state, page) {
      Vue.set(state, 'page', page)
    },
    setCollectionDescriptor(state, collection) {
      Vue.set(state.collections, collection.type, collection)
      console.log(collection.type, 'collection descriptor saved in store')
    },
    setExpanded(state, args) {
      console.log('expanding', args)
      Vue.set(state.allExpanded, args.page, {
        type: args.type,
        id: args.id,
      })
    },
    // add an overlay object to the last object in the overlay chain
    addOverlay(state, args) {
      console.log('adding overlay', args)
      const type = args.type
      const id = args.id
      // can't do recursion using state.commit for some reason
      const addOverlay = (expanded, type, id) => {
        if (expanded.overlay) {
          addOverlay(expanded.overlay, type, id)
        } else {
          Vue.set(expanded, 'overlay', {})
          Vue.set(expanded.overlay, 'type', type)
          Vue.set(expanded.overlay, 'id', id)
        }
      }
      addOverlay(state.allExpanded[state.page], type, id)
    },
    // remove the last overlay object in the overlay chain
    removeOneOverlay(state) {
      console.log('removing one overlay')
      const expanded = state.allExpanded[state.page]
      // if card has no overlays, just collapse it
      if (!expanded.overlay) {
        Vue.set(expanded, 'type', null)
        Vue.set(expanded, 'id', null)
        return
      }
      const removeOneOverlay = (expanded) => {
        // if the overlay has an overlay then skip deleting this overlay and recurse to the next
        if (expanded.overlay.overlay) {
          removeOneOverlay(expanded.overlay)
        } else {
          Vue.delete(expanded, 'overlay')
        }
      }
      removeOneOverlay(expanded)
    },
    toggleMobile(state) {
      Vue.set(state.componentOptions, 'mobile', !state.componentOptions.mobile)
    },
    toggleAdvancedSearch(state) {
      Vue.set(state, 'expandedAdvancedSearch', !state.expandedAdvancedSearch)
    },
    setSearch(state, search) {
      console.log('setting search to', search)
      Vue.set(state, 'search', search)
    },
    updateSerachResults(state) {
      // for each collection, filter the results from the store and put them into
      // the .searchResults attribute
      Object.keys(state.collections).forEach((collectionName) => {
        const collection = state.collections[collectionName]
        const results = collection.filter(state.search)
        Vue.set(collection, 'searchResults', state.search ? results : {})
      })
    },
  },
  actions: {
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
