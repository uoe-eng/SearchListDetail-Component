<template>
  <div v-if="opened" id="advanced-search">
    <div>ADVANCED SEARCH</div>
    <div v-for="collection in collections" :key="collection.name">
      <b>Colection: {{ collection.name }}</b>
      <button @click="toggleAll(collection)">toggle all</button>
      <br />
      <span v-for="column in collection.options.columns" :key="column.alias">
        <label>
          <input
            type="checkbox"
            :checked="column.searchable"
            @click="setColumn(column, !column.searchable)"
          />
          {{ column.alias }}
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
import Vue from 'vue'

export default {
  name: 'AdvancedSearch',
  props: {
    localstore: Object,
  },
  computed: {
    opened() {
      return this.localstore.state.expandedAdvancedSearch
    },
    collections() {
      return this.localstore.state.collections
    },
    searchOptions() {
      return this.localstore.state.searchOptions
    },
  },
  methods: {
    // toggles if the advanced search is opened or not
    toggleOpen() {
      Vue.set(
        this.localstore.state,
        'expandedAdvancedSearch',
        !this.localstore.state.expandedAdvancedSearch
      )
    },

    // handles toggling individual checkboxes
    setColumn(column, state) {
      Vue.set(column, 'searchable', state)
      this.$forceUpdate()
    },

    // toggles all checkboxes for that collection at once
    toggleAll(collection) {
      const currentState = collection.options.columns[0].searchable
      collection.options.columns.forEach((column) => {
        this.setColumn(column, !currentState)
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
