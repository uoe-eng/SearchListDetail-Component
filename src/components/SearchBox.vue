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
import Vue from 'vue'

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
  methods: {
    quickSearch() {
      // console.debug('setting search in store to', this.search)
      Vue.set(this.localstore.state, 'search', this.search)
      this.localstore.dispatch('updateSearchResults')
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
