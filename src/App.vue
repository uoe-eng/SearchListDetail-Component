<template>
  <div id="app">
    <SearchListDetail
      :options="{
        collections: [
          {
            name: 'people',
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
              {
                name: 'matriculation_numbers.matriculation_number',
                alias: 'Matric Number',
              },
              {
                name: 'uun.uun',
                alias: 'UUN',
              },
            ],
            previewOrder: [
              'preferred_name',
              'family_name',
              'email_addresses.email_address',
            ],
          },
          {
            name: 'phone_numbers',
            columns: [
              {
                name: 'phone_number',
                alias: 'Number',
              },
            ],
            show: false,
          },
          {
            name: 'email_addresses',
            columns: [
              {
                name: 'email_address',
                alias: 'Email',
              },
              {
                name: 'person.preferred_name',
              },
            ],
          },
          {
            name: 'matriculation_numbers',
            columns: [
              {
                name: 'matriculation_number',
              },
            ],
            show: false,
          },
          {
            name: 'usernames',
            columns: [
              {
                name: 'uun',
              },
            ],
            show: false,
          },
        ],
        firstAttrAsCardTitle: true,
        countResults: true,
      }"
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
