import config from './config'

export default {
  state: {
    nextTick: undefined,
    page: config.ALL_PAGE_NAME,
    collections: {},
    allExpanded: {},
  },
  mutations: {
    defineNextTick(state, nextTick) {
      state.nextTick = nextTick
    },
    setPage(state, page) {
      console.log('setting page', page)
      state.page = page
    },
    addCollection(state, collection) {
      state.collections[collection.type] = collection
    },
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
    setExpanded(state, args) {
      console.log('expanding', args)
      state.allExpanded[args.page] = {
        type: args.type,
        id: args.id,
      }
    },
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
  },
  actions: {
    setPage(context, page) {
      context.commit('setPage', null)
      context.state.nextTick(() => {
        context.commit('setPage', page)
      })
    },
    refreshPage(context) {
      context.dispatch('setPage', context.state.page)
    },
    setExpanded(context, args) {
      context.commit('setExpanded', args)
    },
    addCollection(context, collection) {
      context.commit('addCollection', collection)
    },
    addOverlay(context, args) {
      context.commit('addOverlay', args)
    },
    removeOneOverlay(context) {
      context.commit('removeOneOverlay')
    },
  },
}
