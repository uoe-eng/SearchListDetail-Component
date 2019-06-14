<template>
  <div id="nav-bar">
    <span
      class="nav-bar-item"
      v-bind:class="{ selected: selected == 'All' }"
      @click="to('All')"
    >
      All
    </span>
    <span
      v-for="collection of collections"
      v-bind:key="collection"
      class="nav-bar-item"
      v-bind:class="{ selected: selected == collection }"
      @click="to(collection)"
    >
      {{ collection }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    collections: Array,
    setView: Function,
    selected: String,
  },
  methods: {
    to(collection) {
      this.setView(collection, null)
    },
  },
}
</script>

<style scoped>
#nav-bar {
  position: fixed;
  padding-top: 20px;
  padding-bottom: 20px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;
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
