<template>
  <div v-if="opened" id="advanced-search">
    <div>ADVANCED SEARCH</div>
    <div v-for="collection in collections" :key="collection.type">
      <b>Colection: {{ collection.type }}</b>
      <button @click="toggleAll(collection.type)">toggle all</button>
      <br />
      <span v-for="column in collection.fullCols" :key="column">
        <label>
          <input
            type="checkbox"
            :checked="searchOptions[collection.type][column]"
            @click="handleClick(collection.type, column)"
          />
          {{ column }}
        </label>
      </span>
    </div>
    <button @click="toggleOpen">Close</button>
  </div>
  <div v-else>
    <button @click="toggleOpen" class="advanced-search-button">
      Advanced settings
    </button>
  </div>
</template>

<script>
export default {
  name: 'AdvancedSearch',
  computed: {
    opened() {
      return this.$store.state.sld.expandedAdvancedSearch
    },
    collections() {
      return this.$store.state.sld.collections
    },
    searchOptions() {
      return this.$store.state.sld.searchOptions
    },
  },
  methods: {
    // toggles if the advanced search is opened or not
    toggleOpen() {
      this.$store.commit('toggleAdvancedSearch')
    },
    // handles toggling individual checkboxes
    handleClick(type, column) {
      this.$store.dispatch('toggleCheckBox', {
        type: type,
        column: column,
      })
    },
    // toggles all checkboxes for that collection at once
    toggleAll(collectionName) {
      this.$store.dispatch('toggleAllCheckboxes', collectionName)
    },
  },
}
</script>

<style scoped>
#advanced-search {
  padding: 15px;
  max-width: var(--card-width);
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;
}

#advanced-search > * {
  margin-bottom: 15px;
}
</style>
