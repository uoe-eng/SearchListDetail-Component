<template>
  <div id="card-search">
    <div v-for="(collection, name) of collectionsToShow" v-bind:key="name">
      <div v-for="(entry, id) of collection.entries" v-bind:key="id">
        <CardView
          :collections="collections"
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
    collections: Object,
    showOnly: String,
  },
  components: {
    CardView,
  },
  computed: {
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
