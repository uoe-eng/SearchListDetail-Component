import Vue from 'vue'
import Vuex from 'vuex'
import config from './config'
import util from './util'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    page: config.ALL_PAGE_NAME,
    collections: [],
    search: '',
    expandedAdvancedSearch: false,
    sldProp: {},
    pendingRequests: 0,
    searchTimeout: null,
    globalstore: () => {},
    populateTables: () => {},
  },
  mutations: {
    setPage(state, page) {
      Vue.set(state, 'page', page)
    },
    updatesearchFilter(state, collection) {
      Vue.set(
        collection,
        'searchResults',
        util.filterEntries(state.globalstore(), collection, state.search)
      )
    },
    updateSearchResults(state) {
      util.log('updating search results')

      const fetchEntries = () => {
        console.log('short search')
        // for each collection, filter the results from the store and put them into
        // the .searchResults attribute
        state.collections.forEach((collection) => {
          if (collection.options.show === false) return

          // do a quick filter in case no columns are ticked
          Vue.set(
            collection,
            'searchResults',
            util.filterEntries(state.globalstore(), collection, state.search)
          )

          if (state.search === '') return

          collection.options.columns.forEach((column) => {
            fetchEntry(collection, column)
          })
        })
      }

      const fetchEntry = (collection, column) => {
        if (!column.searchable) return

        state.pendingRequests++
        // prettier-ignore
        state.globalstore().dispatch(
          'jv/get',
          [
            collection.name,
            {
              params: {
                [`filter[${column.name}:ilike]`]: '*' + state.search + '*',
              },
            },
          ]
        ).then(() => {
          Vue.set(collection, 'searchResults', util.filterEntries(
            state.globalstore(),
            collection,
            state.search
          ))
          state.populateTables()

          state.pendingRequests--
          // if this is the last request to finish
          if (state.pendingRequests === 0) {
            // fetchRelationships()
          }
        })
      }

      const fetchRelationships = () => {
        if (state.pendingRequests !== 0) {
          console.log('short search not complete yet...')
          setTimeout(fetchRelationships, 0)
          return
        }
        console.log('long search')
        // fetch relationships for all columns
        state.collections.forEach((collection) => {
          if (collection.options.show === false) return

          if (collection.searchResults.length === 0) return

          const anyEntry = util.getEntry(
            state.globalstore(),
            collection.name,
            collection.searchResults[0]
          )
          const relationships = Object.keys(anyEntry._jv.relationships)
          collection.options.columns.forEach((column) => {
            fetchRelationship(collection, column, relationships)
          })
        })
      }

      // prettier-ignore
      const fetchRelationship = (collection, column, relationships) => {
        state.pendingRequests++
        state.globalstore().dispatch(
          'jv/get',
          [
            collection.name,
            {
              params: {
                [`filter[${column.name}:ilike]`]: '*' + state.search + '*',
                include: relationships.join(','),
              },
            },
          ],
        ).then(() => {
          state.pendingRequests--
          Vue.set(collection, 'searchResults', util.filterEntries(
            state.globalstore(),
            collection,
            state.search
          ))
          state.populateTables()
        })
      }

      clearTimeout(state.shortSearchTimeout)
      state.shortSearchTimeout = setTimeout(
        fetchEntries,
        config.SHORT_SEARCH_TIMEOUT
      )

      clearTimeout(state.longSearchTimeout)
      state.longSearchTimeout = setTimeout(
        fetchRelationships,
        config.LONG_SEARCH_TIMEOUT
      )
    },
  },
  actions: {
    patch(context, entry) {
      context.state
        .globalstore()
        .dispatch('jv/patch', entry)
        .then(() => {
          context.dispatch('updateSearchResults')
        })
    },
    updateSearchResults(context) {
      context.commit('updateSearchResults')
    },
    setPage(context, page) {
      console.debug('setting page', page)
      context.commit('setPage', null)
      context.state.nextTick(() => {
        context.commit('setPage', page)
      })
    },
    refreshPage(context) {
      context.dispatch('setPage', this.page)
    },
    updatesearchFilter(context, collection) {
      context.commit('updatesearchFilter', collection)
    },
  },
})
