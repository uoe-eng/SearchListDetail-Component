<template>
  <div id="nav-bar">
    <span
      class="nav-bar-item"
      :class="{ selected: selected == config.ALL_PAGE_NAME }"
      @click="setPage(config.ALL_PAGE_NAME)"
    >
      {{ config.ALL_PAGE_TEXT }}
      <span v-if="displayResultCount">({{ countResults(collections) }})</span>
    </span>
    <span
      v-for="collection of collections"
      :key="collection.name"
      class="nav-bar-item"
      :class="{ selected: selected == collection.name }"
      @click="setPage(collection.name)"
    >
      {{ collection.name }}
      <span v-if="displayResultCount">
        ({{ countResults([collection]) }})
      </span>
    </span>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'NavBar',
  props: {
    localstore: Object,
    displayResultCount: Boolean,
  },
  data() {
    return {
      config: config,
    }
  },
  methods: {
    setPage(page) {
      this.localstore.dispatch('setPage', page)
    },
    countResults(listOfCollections) {
      return listOfCollections.reduce((count, collection) => {
        return count + collection.searchResults.length
      }, 0)
    },
  },
  computed: {
    selected() {
      return this.localstore.state.page
    },
    collections() {
      return this.localstore.state.collections.filter((collection) => {
        return collection.options.show
      })
    },
  },
}
</script>

<style scoped>
#nav-bar {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-radius: 3px;
  overflow-x: auto;
  white-space: nowrap;
  width: fit-content;
  max-width: 100vw;
  min-height: 20px;
}

#nav-bar .nav-bar-item {
  color: var(--alt-text-color);
  padding: 10px;
  cursor: pointer;
  text-transform: uppercase;
}

#nav-bar .nav-bar-item.selected {
  color: var(--text-color);
  font-weight: bold;
}
</style>
