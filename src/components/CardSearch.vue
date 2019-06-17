<template>
  <div id="card-search">
    <div v-for="(collectionName, index) of collectionNames" v-bind:key="index">
      <div v-for="(value, id) of collections[collectionName]" v-bind:key="id">
        <CardView
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
  computed: {
    sessions() {
      return this.$store.state.jv._jv
    },
    collections() {
      let collections = {}
      this.collectionNames.forEach((collectionName) => {
        collections[collectionName] = this.$store.getters['jv/get'](
          collectionName
        )
      })
      return collections
    },
  },
  methods: {
    patchRecord(record) {
      this.$store.dispatch('jv/patch', record)
    },
    postRecord(record) {
      this.$store.dispatch('jv/post', record)
    },
    deleteRecord(id) {
      this.$store.dispatch('jv/delete', 'widget' + '/' + id)
    },
  },
}
</script>
