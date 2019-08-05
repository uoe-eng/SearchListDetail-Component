<template>
  <div id="card-search">
    <span v-if="noResults()">No results :(</span>
    <div v-for="collection of collectionsToShow" :key="collection.name">
      <div v-for="(entry, id) of collection.searchResults" :key="id">
        <CardView
          class="card-result"
          :type="collection.name"
          :id="id"
          :isReadOnly="!isExpanded(id, collection)"
          :isExpanded="isExpanded(id, collection)"
          :expanded="expanded"
          :localstore="localstore"
        ></CardView>
      </div>
    </div>
  </div>
</template>

<script>
import CardView from './CardView'

export default {
  name: 'CardSearch',
  props: {
    localstore: Object,
    showOnly: String,
  },
  components: {
    CardView,
  },
  computed: {
    collections() {
      return this.localstore.state.collections
    },
    // returns a list of collections that should be displayed on the page
    // if specified, only show one collection
    collectionsToShow() {
      if (this.showOnly) {
        return [this.localstore.state.getCollection(this.showOnly)]
      } else {
        return this.collections
      }
    },
    expanded() {
      return this.localstore.state.expansionState[this.page]
    },
    page() {
      return this.localstore.state.page
    },
  },
  methods: {
    isExpanded(id, collection) {
      return id == this.expanded.id && collection.name == this.expanded.type
    },
    noResults() {
      let noResults = true
      this.collectionsToShow.forEach((collection) => {
        if (Object.keys(collection.searchResults).length !== 0) {
          noResults = false
        }
      })
      return noResults && this.localstore.state.pendingRequests === 0
    },
  },
}
</script>
