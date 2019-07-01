<template>
  <div id="app">
    <SearchListDetail
      :resultOptions="{
        person: {
          columns: [
            {
              name: 'name',
              // caseSensitive defaults to false
              // searchOperator defaults to 'contains'
              searchOperator: 'startsWith',
            },
            {
              name: 'title',
              searchOperator: 'matches',
            },
            {
              name: 'job',
              caseSensitive: true,
            },
          ],
          previewOrder: ['name', 'title'],
        },
        widget: {
          columns: [
            {
              name: 'name',
            },
            {
              name: 'color',
              searchOperator: 'endsWith',
            },
            {
              name: 'widgets.name',
            },
          ],
          previewOrder: ['name'],
        },
      }"
      :firstAttrAsCardTitle="true"
      detailsTitle="details"
      detailsText="+"
      :countResults="true"
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

<style>
* {
  font-family: 'Montserrat', sans-serif;
}

body {
  margin: 0;
}
</style>
