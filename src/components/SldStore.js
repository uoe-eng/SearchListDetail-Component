import config from './config'

export default {
  state: {
    nextTick: undefined,
    page: config.ALL_PAGE_NAME,
    collections: {},
    allExpanded: {},
    componentOptions: {},
    search: '',
    searchOptions: {},
    expandedAdvancedSearch: false,
    resultOptions: {},
  },
  mutations: {
    // called on creation so it can be used in the future
    defineNextTick(state, nextTick) {
      state.nextTick = nextTick
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
      state.allExpanded = allExpanded
    },
    initialiseSearchOptions(state) {
      const collectionNames = Object.keys(state.resultOptions)
      collectionNames.forEach((collectionName) => {
        state.searchOptions[collectionName] = {}
        const columns = state.resultOptions[collectionName].columns
        columns.forEach((column) => {
          state.searchOptions[collectionName][column.name] = true
        })
      })
    },
    setResultOptions(state, resultOptions) {
      state.resultOptions = resultOptions
    },
    toggleCheckBox(state, args) {
      const type = args.type
      const column = args.column
      state.searchOptions[type][column] = !state.searchOptions[type][column]
    },
    toggleAllCheckboxes(state, collectionName) {
      const columns = state.collections[collectionName].fullCols
      const currentState = state.searchOptions[collectionName][columns[0]]
      console.log('toggling all to', !currentState)
      columns.forEach((column) => {
        state.searchOptions[collectionName][column] = !currentState
      })
    },
    setComponentOptions(state, options) {
      state.componentOptions = options
    },
    setPage(state, page) {
      state.page = page
    },
    setCollectionDescriptor(state, collection) {
      state.collections[collection.type] = collection
      console.log(collection.type, 'collection descriptor saved in store')
    },
    setExpanded(state, args) {
      console.log('expanding', args)
      state.allExpanded[args.page] = {
        type: args.type,
        id: args.id,
      }
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
          expanded.overlay = {}
          expanded.overlay.type = type
          expanded.overlay.id = id
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
        expanded.type = null
        expanded.id = null
        return
      }
      const removeOneOverlay = (expanded) => {
        // if the overlay has an overlay then skip deleting this overlay and recurse to the next
        if (expanded.overlay.overlay) {
          removeOneOverlay(expanded.overlay)
        } else {
          delete expanded.overlay
        }
      }
      removeOneOverlay(expanded)
    },
    toggleMobile(state) {
      state.componentOptions.mobile = !state.componentOptions.mobile
    },
    toggleAdvancedSearch(state) {
      state.expandedAdvancedSearch = !state.expandedAdvancedSearch
    },
    setSearch(state, search) {
      console.log('setting search to', search)
      state.search = search
    },
    updateSerachResults(state) {
      // for each collection, filter the results from the store and put them into
      // the .searchResults attribute
      Object.keys(state.collections).forEach((collectionName) => {
        const collection = state.collections[collectionName]
        const results = collection.filter(state.search, this)
        collection.searchResults = state.search ? results : {}
      })
    },
  },
  actions: {
    patchResult(context, args) {
      const type = args.type
      const id = args.id
      console.log('patching search result with id', id)
      const entry = context.state.collections[type].getClean(id)
      context.dispatch('jv/patch', entry).then(() => {
        context.commit('updateSerachResults')
      })
    },
    setPage(context, page) {
      console.log('setting page', page)
      context.commit('setPage', null)
      context.state.nextTick(() => {
        context.commit('setPage', page)
      })
    },
    refreshPage(context) {
      console.log('refreshing page')
      context.dispatch('setPage', context.state.page)
    },
    setExpanded(context, args) {
      context.commit('setExpanded', args)
      context.dispatch('refreshPage')
    },
    setCollectionDescriptor(context, collection) {
      context.commit('setCollectionDescriptor', collection)
      context.commit('updateSerachResults')
      context.dispatch('refreshPage')
    },
    updateEntries(context, args) {
      context.commit('updateEntries', args)
    },
    addOverlay(context, args) {
      context.commit('addOverlay', args)
      context.dispatch('refreshPage')
    },
    removeOneOverlay(context) {
      context.commit('removeOneOverlay')
      context.dispatch('refreshPage')
    },
    toggleMobile(context) {
      context.commit('toggleMobile')
      context.dispatch('refreshPage')
    },
    search(context, search) {
      context.commit('setSearch', search)
      context.commit('updateSerachResults')
    },
    toggleCheckBox(context, args) {
      context.commit('toggleCheckBox', args)
      context.commit('updateSerachResults')
      context.dispatch('refreshPage')
    },
    toggleAllCheckboxes(context, collectionName) {
      context.commit('toggleAllCheckboxes', collectionName)
      context.commit('updateSerachResults')
      context.dispatch('refreshPage')
    },
  },
}
