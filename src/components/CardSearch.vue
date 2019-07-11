<template>
  <div id="card-search">
    <div v-for="(collection, name) of collectionsToShow" :key="name">
      <div v-for="(entry, id) of collection.searchResults" :key="id">
        <CardView
          :type="collection.type"
          :id="id"
          :isReadOnly="!isExpanded(id, collection)"
          :isExpanded="isExpanded(id, collection)"
          :expanded="expanded"
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
    showOnly: String,
  },
  components: {
    CardView,
  },
  computed: {
    collections() {
      return this.$store.state.sld.collections
    },
    // returns a list of collections that should be displayed on the page
    // if specified, only show one collection
    collectionsToShow() {
      if (this.showOnly) {
        return {
          [this.showOnly]: this.collections[this.showOnly],
        }
      } else {
        return this.collections
      }
    },
    expanded() {
      return this.$store.state.sld.allExpanded[this.page]
    },
    page() {
      return this.$store.state.sld.page
    },
  },
  methods: {
    isExpanded(id, collection) {
      return id == this.expanded.id && collection.type == this.expanded.type
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
