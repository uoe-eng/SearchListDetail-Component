<template>
  <div id="card-search">
    <div v-for="(collection, name) of collectionsToShow" v-bind:key="name">
      <div></div>
      <div v-for="(entry, id) of collection.entries" v-bind:key="id">
        <CardView
          :collections="collections"
          :type="collection.type"
          :id="id"
          :page="page"
          :onClick="onClick"
          :onClose="onClose"
          :onSave="onSave"
          :isReadOnly="
            !(id == expandedID.id && collection.type == expandedID.type)
          "
          :isExpanded="
            id == expandedID.id && collection.type == expandedID.type
          "
          :expandedID="expandedID"
          :addOverlay="addOverlay"
          :componentOptions="componentOptions"
        ></CardView>
      </div>
    </div>
  </div>
</template>

<script>
import CardView from './CardView'

export default {
  name: 'CardSearch',
  props: {
    collections: Object,
    showOnly: String,
    page: String,
    expandedID: Object,
    addOverlay: Function,
    onClick: Function,
    onClose: Function,
    onSave: Function,
    componentOptions: Object,
  },
  components: {
    CardView,
  },
  computed: {
    // if specified, only show one collection
    collectionsToShow() {
      if (this.showOnly) {
        return {
          [this.showOnly]: this.collections[this.showOnly],
        }
      } else {
        return this.collections
      }
    },
  },
}
</script>

<style scoped>
#card-search {
  max-width: var(--card-width);
  overflow-y: auto;
}
</style>
