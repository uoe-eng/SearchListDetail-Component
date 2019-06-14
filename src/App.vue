<template>
  <div id="app">
    <SearchListDetail
      :collectionNames="collections"
      :columnNames="columns"
      :options="options"
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
  data() {
    return {
      collections: ['person', 'widget'],
      columns: {
        person: ['name', 'title', 'job'],
        widget: ['name', 'color'],
      },
      options: {
        firstAttrAsCardTitle: true,
        detailsTitle: 'details',
        detailsText: '+',
      },
    }
  },
}
</script>

<style lang="scss">
body {
  font-family: 'Montserrat', sans-serif;
}
</style>
