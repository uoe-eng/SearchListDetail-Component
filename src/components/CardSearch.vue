<template>
  <div id="card-search">
    <div v-for="collection of collectionsToShow" :key="collection.name">
      <div v-for="(entry, id) of collection.searchResults" :key="id">
        <CardView
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
  },
}
</script>

<style scoped>
#card-search {
  max-width: var(--card-width);
  overflow-y: auto;
}
</style>
