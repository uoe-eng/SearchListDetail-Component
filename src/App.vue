<template>
  <div id="app">
    <SearchListDetail
      :resultOptions="{
        people: {
          columns: [
            {
              name: 'given_name',
              // caseSensitive defaults to false
              // searchOperator defaults to 'contains'
            },
            {
              name: 'family_name',
            },
            {
              name: 'preferred_name',
            },
            {
              name: 'email_addresses.email_address',
            },
            {
              name: 'phone_number.phone_number',
            },
          ],
          previewOrder: ['preferred_name', 'family_name'],
        },
        phone_numbers: {
          columns: [
            {
              name: 'phone_number',
            },
          ],
        },
        email_addresses: {
          columns: [
            {
              name: 'email_address',
            },
          ],
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
