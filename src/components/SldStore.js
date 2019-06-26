import config from './config'

export default {
  state: {
    page: config.ALL_PAGE_NAME,
    collections: {},
  },
  mutations: {
    setPage(state, page) {
      state.page = page
    },
    addCollection(state, collection) {
      state.collections[collection.type] = collection
    },
  },
  actions: {
    setPage(context, args) {
      const page = args.page
      const nextTick = args.nextTick
      context.commit('setPage', null)
      nextTick(() => {
        context.commit('setPage', page)
      })
    },
    refreshPage(context, nextTick) {
      context.dispatch('setPage', {
        page: context.state.page,
        nextTick: nextTick,
      })
    },
    addCollection(context, collection) {
      context.commit('addCollection', collection)
    },
  },
}
