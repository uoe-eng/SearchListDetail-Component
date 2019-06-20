<template>
  <div id="app">
    <SearchListDetail
      :collectionNames="['person', 'widget']"
      :fullColumnNames="{
        person: ['name', 'title', 'job'],
        widget: ['name', 'color'],
      }"
      :previewColumnNames="{
        person: ['name', 'title'],
        widget: ['name'],
      }"
      :firstAttrAsCardTitle="true"
      detailsTitle="details"
      detailsText="+"
    ></SearchListDetail>
  </div>
</template>

<script>
import SearchListDetail from './components/SearchListDetail'
import store from './store'

export default {
  name: 'app',
  components: {
    SearchListDetail,
  },
  store,
}
</script>

<style lang="scss">
* {
  font-family: 'Montserrat', sans-serif;
}
</style>
