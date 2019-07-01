<template>
  <div id="nav-bar">
    <span
      class="nav-bar-item"
      v-bind:class="{ selected: selected == config.ALL_PAGE_NAME }"
      @click="setPage(config.ALL_PAGE_NAME)"
    >
      All
      <span v-if="displayResultCount">
        ({{ countResults(config.ALL_PAGE_NAME) }})
      </span>
    </span>
    <span
      v-for="collectionName of collectionNames"
      v-bind:key="collectionName"
      class="nav-bar-item"
      v-bind:class="{ selected: selected == collectionName }"
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
      if (collectionName == config.ALL_PAGE_NAME) {
        return this.collectionNames.reduce((count, collectionName) => {
          const entries = this.collections[collectionName].entries
          return count + Object.keys(entries).length
        }, 0)
      } else {
        const entries = this.collections[collectionName].entries
        return Object.keys(entries).length
      }
    },
  },
  computed: {
    selected() {
      return this.$store.state.sld.page
    },
    collections() {
      return this.$store.state.sld.collections
    },
    collectionNames() {
      return Object.keys(this.collections)
    },
  },
}
</script>

<style scoped>
#nav-bar {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 3px;
  overflow-x: auto;
  white-space: nowrap;
  width: fit-content;
  max-width: 100%;
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
