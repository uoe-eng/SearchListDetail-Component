<template>
  <div id="nav-bar">
    <span
      class="nav-bar-item"
      v-bind:class="{ selected: selected == config.ALL_PAGE_NAME }"
      @click="setPage(config.ALL_PAGE_NAME)"
    >
      All
    </span>
    <span
      v-for="collectionName of collectionNames"
      v-bind:key="collectionName"
      class="nav-bar-item"
      v-bind:class="{ selected: selected == collectionName }"
      @click="setPage(collectionName)"
    >
      {{ collectionName }}
    </span>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'NavBar',
  props: {
    collectionNames: Array,
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
  },
  computed: {
    selected() {
      return this.$store.state.sld.page
    },
  },
}
</script>

<style scoped>
#nav-bar {
  padding-top: 20px;
  padding-bottom: 20px;
  margin-bottom: 10px;
  height: 20px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;
  overflow-x: auto;
  white-space: nowrap;
  width: fit-content;
  max-width: 100%;
}

#nav-bar .nav-bar-item {
  padding: 20px;
  cursor: pointer;
  text-transform: uppercase;
}

#nav-bar .nav-bar-item.selected {
  background-color: rgba(0, 0, 0, 0.03);
}

#nav-bar .nav-bar-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
