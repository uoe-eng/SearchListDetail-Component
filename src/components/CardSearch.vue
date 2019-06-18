<template>
  <div id="card-search">
    <div v-for="(collectionName, index) of collectionNames" v-bind:key="index">
      <div v-for="(value, id) of collections[collectionName]" v-bind:key="id">
        <CardView
          :collection="collections[collectionName]"
          :collectionName="collectionName"
          :allColumnNames="allColumnNames[collectionName]"
          :previewColumnNames="previewColumnNames[collectionName]"
          :id="id"
          :globalOptions="globalOptions"
          :onClick="onClick"
          :readOnly="true"
          :previewMode="true"
          :expandOnClick="expandOnClick"
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
    collectionNames: Array,
    allColumnNames: Object,
    previewColumnNames: Object,
    globalOptions: Object,
    onClick: Function,
    expandOnClick: Boolean,
  },
  components: {
    CardView,
  },
}
</script>
