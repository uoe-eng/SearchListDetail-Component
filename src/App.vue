<template>
  <div id="app">
    <SearchListDetail
      :resultOptions="{
        person: {
          columns: [
            {
              name: 'name',
            },
            {
              name: 'title',
              searchOperator: 'matches',
            },
            {
              name: 'job',
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
            },
          ],
          previewOrder: ['name'],
        },
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
