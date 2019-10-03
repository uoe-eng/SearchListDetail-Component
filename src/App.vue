<template>
  <div id="app">
    <SearchListDetail
      :collections="[
        {
          name: 'people',
          columns: [
            { name: 'preferred_name', alias: 'First Name' },
            { name: 'family_name', alias: 'Last Name' },
            { name: 'middle_names', alias: 'Middle Name' },
            { name: 'email_addresses.email_address', alias: 'Email' },
            { name: 'phone_number.phone_number', alias: 'Phone' },
          ],
          previewOrder: [
            'family_name',
            'preferred_name',
          ],
        },
        {
          name: 'phone_numbers',
          columns: [{ name: 'phone_number', alias: 'Number' }],
          show: true,
        },
        {
          name: 'email_addresses',
          columns: [
            { name: 'email_address', alias: 'Email' },
            { name: 'person.preferred_name' },
          ],
        },
      ]"
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
