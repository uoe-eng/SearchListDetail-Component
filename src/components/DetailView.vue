<template>
  <div class="details">
    <div v-for="(key, index) of keys" v-bind:key="index">
      {{key}}:
      <input type="text" :value="details[key]">
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailView',
  props: {
    details: Object,
  },
  data() {
    return {
      keys: Object.keys(this.details),
    }
  },
}
</script>

