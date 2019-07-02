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
  },
  mutations: {
    // called on creation so it can be used in the future
    defineNextTick(state, nextTick) {
      state.nextTick = nextTick
    },
    // called on creation to define the data structure for allExpanded
    initialiseExpanded(state, resultOptions) {
      let allExpanded = {
        [config.ALL_PAGE_NAME]: {},
      }
      const collectionNames = Object.keys(resultOptions)
      collectionNames.forEach((name) => {
        allExpanded[name] = {}
      })
      state.allExpanded = allExpanded
    },
    initialiseSearchOptions(state, resultOptions) {
      const collectionNames = Object.keys(resultOptions)
      collectionNames.forEach((collectionName) => {
        state.searchOptions[collectionName] = {}
        const columns = resultOptions[collectionName].columns
        columns.forEach((column) => {
          state.searchOptions[collectionName][column.name] = true
        })
      })
    },
    toggleCheckBox(state, args) {
      const type = args.type
      const column = args.column
      state.searchOptions[type][column] = !state.searchOptions[type][column]
    },
    setComponentOptions(state, options) {
      state.componentOptions = options
    },
    setPage(state, page) {
      state.page = page
    },
    setCollection(state, collection) {
      state.collections[collection.type] = collection
    },
    // used to set the search results
    updateEntries(state, args) {
      const entries = args.entries
      const type = args.type
      state.collections[type].entries = entries
    },
    // following update functions are useful to use instead of setCollection
    // since the class methods might get overwritten if a deep copy is modified
    // updates the unfiltered entries
    updateEntry(state, args) {
      const newEntry = args.newEntry
      const type = args.type
      const id = args.id
      state.collections[type].unfilteredEntries[id] = newEntry
    },
    // updates the unfiltered entries
    updateCell(state, args) {
      const newValue = args.newValue
      const type = args.type
      const id = args.id
      const column = args.column
      state.collections[type].unfilteredEntries[id][column] = newValue
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
    setSearch(state, search) {
      state.search = search
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
    refreshPage(context) {
      console.log('refreshing page')
      context.dispatch('setPage', context.state.page)
    },
    setExpanded(context, args) {
      context.commit('setExpanded', args)
      context.dispatch('refreshPage')
    },
    setCollection(context, collection) {
      context.commit('setCollection', collection)
      // context.dispatch('refreshPage')
    },
    updateEntries(context, args) {
      context.commit('updateEntries', args)
    },
    updateEntry(context, args) {
      context.commit('updateEntry', args)
    },
    updateCell(context, args) {
      context.commit('updateCell', args)
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
    },
    setSearch(context, search) {
      context.commit('setSearch', search)
    },
    toggleCheckBox(context, args) {
      context.commit('toggleCheckBox', args)
    },
  },
}
