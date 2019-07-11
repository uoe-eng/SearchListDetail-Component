<template>
  <div id="app">
    <SearchListDetail
      :resultOptions="{
        people: {
          columns: [
            {
              name: 'preferred_name',
              alias: 'First Name',
              // caseSensitive defaults to false
              // searchOperator defaults to 'contains'
            },
            {
              name: 'family_name',
              alias: 'Last Name',
            },
            {
              name: 'email_addresses.email_address',
              alias: 'Email',
            },
            {
              name: 'phone_number.phone_number',
              alias: 'Phone',
            },
          ],
          previewOrder: ['preferred_name', 'family_name'],
        },
        phone_numbers: {
          columns: [
            {
              name: 'phone_number',
              alias: 'Number',
            },
          ],
        },
        email_addresses: {
          columns: [
            {
              name: 'email_address',
              alias: 'Email',
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
