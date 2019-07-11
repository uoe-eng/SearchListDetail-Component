import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { jsonapiModule } from 'jsonapi-vuex'

Vue.use(Vuex)

const api = axios.create({
  // connect to local jsonapi-mock server
  baseURL: 'http://localhost:6543/api',
  headers: {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  },
})

export default new Vuex.Store({
  strict: true,
  modules: {
    jv: jsonapiModule(api, { action_status_clean_age: 10 }),
  },
})
