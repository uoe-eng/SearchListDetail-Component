<template>
  <input
    v-model="search"
    id="search"
    type="text"
    placeholder="Type to search..."
    autocomplete="off"
    @input="quickSearch()"
  />
</template>

<script>
export default {
  name: 'SearchBox',
  data() {
    return {
      search: '',
    }
  },
  computed: {
    collections() {
      return this.$store.state.sld.collections
    },
  },
  methods: {
    quickSearch: function() {
      Object.keys(this.collections).forEach((collectionName) => {
        const collection = this.collections[collectionName]
        collection.filter(this.search, this.$store)
      })
      this.$store.dispatch('setSearch', this.search)
      this.$store.dispatch('setExpanded', {
        page: this.$store.state.sld.page,
        type: null,
        id: null,
      })
    },
  },
}
</script>

<style scoped>
#search {
  max-width: var(--card-width);
  padding: 20px;
  margin-bottom: 10px;
  outline: none;
  border: none;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;
}
</style>
