import Vue from 'vue'
import Vuex from 'vuex'
import config from './config'

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
    getCollection: function(name) {
      const collectionNames = this.collections.map((c) => c.name)
      const index = collectionNames.indexOf(name)
      if (index === -1) {
        console.error(
          'Collection',
          name,
          'was not found, make sure it is specified in the props.'
        )
      }
      return this.collections[index]
    },
    cleanEntry: function(entry) {
      let clean = {
        _jv: entry._jv,
      }
      Object.keys(entry).forEach((column) => {
        if (typeof entry[column] === 'object') return
        clean[column] = entry[column]
      })
      return clean
    },
    getEntry: function(type, id) {
      const storeEntry = this.globalstore().getters['jv/get'](type + '/' + id)
      const collection = this.getCollection(type)
      if (collection === undefined) return storeEntry

      const searchResult = collection.searchResults[id]
      if (searchResult === undefined) return storeEntry

      return searchResult
    },
  },
  mutations: {
    setPage(state, page) {
      Vue.set(state, 'page', page)
    },
    updateSearchResults(state) {
      const fetchEntries = () => {
        console.log('short search')
        // for each collection, filter the results from the store and put them into
        // the .searchResults attribute
        state.collections.forEach((collection) => {
          if (collection.options.show === false) return

          // do a quick filter in case no columns are ticked
          const results = collection.filter(state.search)
          Vue.set(collection, 'searchResults', state.search ? results : {})

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
          const results = collection.filter(state.search)
          Vue.set(collection, 'searchResults', state.search ? results : {})
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

          const resultKeys = Object.keys(collection.searchResults)
          if (resultKeys.length === 0) return

          const anyEntry = collection.searchResults[resultKeys[0]]
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
          const results = collection.filter(state.search)
          Vue.set(collection, 'searchResults', state.search ? results : {})
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
      // console.debug('updating search results')
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
  },
})
