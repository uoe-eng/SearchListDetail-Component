<template>
  <div id="card-search">
    <div v-for="(collection, name) of collections" v-bind:key="name">
      <div v-for="(entry, id) of collection.entries" v-bind:key="id">
        <CardView
          :collection="collection"
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
    page: String,
    expandedID: Object,
    onClick: Function,
    onClose: Function,
    onSave: Function,
    componentOptions: Object,
  },
  data() {
    return {
      collectionNames: Object.keys(this.collections),
    }
  },
  components: {
    CardView,
  },
}
</script>

<style scoped>
#card-search {
  max-width: var(--card-width);
  overflow-y: auto;
}
</style>
