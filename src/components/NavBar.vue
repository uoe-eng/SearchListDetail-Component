<template>
  <div id="nav-bar">
    <span
      class="nav-bar-item"
      :class="{ selected: selected == config.ALL_PAGE_NAME }"
      @click="setPage(config.ALL_PAGE_NAME)"
    >
      All
      <span v-if="displayResultCount">
        ({{ countResults(config.ALL_PAGE_NAME) }})
      </span>
    </span>
    <span
      v-for="collectionName of collectionNames"
      :key="collectionName"
      class="nav-bar-item"
      :class="{ selected: selected == collectionName }"
      @click="setPage(collectionName)"
    >
      {{ collectionName }}
      <span v-if="displayResultCount">
        ({{ countResults(collectionName) }})
      </span>
    </span>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'NavBar',
  props: {
    displayResultCount: Boolean,
  },
  data() {
    return {
      config: config,
    }
  },
  methods: {
    setPage(page) {
      this.$store.dispatch('setPage', page)
    },
    countResults(collectionName) {
      const loadingText = '...'
      if (collectionName == config.ALL_PAGE_NAME) {
        return this.collectionNames.reduce((count, collectionName) => {
          const countedResults = this.countResults(collectionName)
          if (countedResults == loadingText) return count
          return count + countedResults
        }, 0)
      } else {
        const collections = this.$store.state.sld.collections
        // while collection is still being downloaded, show ... to indicate it
        if (!collections[collectionName]) return loadingText
        const searchResults = collections[collectionName].searchResults
        return Object.keys(searchResults).length
      }
    },
  },
  computed: {
    selected() {
      return this.$store.state.sld.page
    },
    collectionNames() {
      return Object.keys(this.$store.state.sld.searchOptions)
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
