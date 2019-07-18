<template>
  <input
    v-model="search"
    id="search"
    type="text"
    placeholder="Type to search..."
    autocomplete="off"
    autofocus
    @input="quickSearch"
  />
</template>

<script>
export default {
  name: 'SearchBox',
  props: {
    localstore: Object,
  },
  data() {
    return {
      search: '',
    }
  },
  computed: {
    collections() {
      console.log('computing collections')
      return this.localstore.state.collections
    },
  },
  methods: {
    quickSearch() {
      console.log('quick search')
      this.localstore.dispatch('search', this.search)
      this.localstore.dispatch('setExpanded', {
        page: this.localstore.state.page,
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
