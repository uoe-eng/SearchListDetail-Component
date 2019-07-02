<template>
  <div v-if="opened" id="advanced-search">
    <div>ADVANCED SEARCH</div>
    <div v-for="collection in collections" :key="collection.type">
      Colection: {{ collection.type }}
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
    <button @click="opened = false">Close</button>
  </div>
  <div v-else>
    <button @click="opened = true" class="advanced-search-button">
      Advanced settings
    </button>
  </div>
</template>

<script>
export default {
  name: 'AdvancedSearch',
  data() {
    return {
      opened: false,
    }
  },
  computed: {
    collections() {
      return this.$store.state.sld.collections
    },
    searchOptions() {
      return this.$store.state.sld.searchOptions
    },
  },
  methods: {
    handleClick(type, column) {
      this.$store.dispatch('toggleCheckBox', {
        type: type,
        column: column,
      })
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
