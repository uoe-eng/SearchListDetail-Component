<template>
  <div class="sld-card-view" @click="setView(collectionName, id)">
    <span v-if="title != null" class="title">{{ title }}</span>
    <span class="subtitle">{{ collectionName }}</span>
    <table class="sld-card-view-details">
      <tr v-for="column of columnsToShow" v-bind:key="column">
        <td class="column">{{ column }}:</td>
        <td class="value">{{ details[column] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CardView',
  props: {
    collectionName: String,
    columnNames: Array,
    id: String,
    options: Object,
    setView: Function,
  },
  computed: {
    details() {
      return this.$store.getters['jv/get'](this.collectionName + '/' + this.id)
    },
    title() {
      const details = this.$store.getters['jv/get'](
        this.collectionName + '/' + this.id
      )
      // don't set the title unless specified
      if (this.options.firstAttrAsCardTitle) {
        return details[this.columnNames[0]]
      } else {
        return null
      }
    },
    columnsToShow() {
      // firstattribute reserved for title if specified
      if (this.options.firstAttrAsCardTitle) {
        return this.columnNames.slice(1)
      } else {
        return this.columnNames
      }
    },
  },
}
</script>

<style scoped>
.sld-card-view {
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px;
  max-width: 500px;
  cursor: pointer;
}

.sld-card-view:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.sld-card-view .column {
  color: grey;
}

.sld-card-view .title {
  padding-right: 10px;
  font-size: larger;
  font-weight: bold;
}

.sld-card-view .subtitle {
  color: grey;
  font-style: italic;
}

.sld-card-view-details {
  padding-top: 10px;
}
</style>
