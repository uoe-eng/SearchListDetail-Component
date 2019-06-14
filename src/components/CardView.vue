<template>
  <div
    class="sld-card-view"
    v-bind:class="{ pointer: onClick && previewMode }"
    @click="handleClick"
  >
    <span v-if="title != null" class="title">{{ title }}</span>
    <span class="subtitle">{{ collectionName }} / {{ id }}</span>
    <form v-on:submit.prevent="save">
      <table class="sld-card-view-details">
        <tr v-for="column of columnsToShow" v-bind:key="column">
          <td class="column">{{ column }}:</td>
          <td class="value">
            <span v-if="readOnlyLocal">{{ details[column] }}</span>
            <input type="text" v-else v-model="details[column]" />
          </td>
        </tr>
      </table>
    </form>
    <div class="controls" v-if="!readOnlyLocal">
      <span class="close" @click="closeActionLocal">Close</span>
      <span class="save" @click="save">Save</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardView',
  props: {
    collectionName: String,
    previewColumnNames: Array,
    allColumnNames: Array,
    id: String,
    options: Object,
    onClick: Function,
    closeAction: Function,
    readOnly: Boolean,
    previewMode: Boolean,
    expandOnClick: Boolean,
  },
  data() {
    return {
      // save as local data so that it can be modified dynamically
      readOnlyLocal: this.readOnly,
      previewModeLocal: this.previewMode,
      // really hacky, but the handleClick function always runs after this,
      // which means that the card closes then opens again
      closeActionLocal: this.expandOnClick
        ? () => {
          setTimeout(() => {
            this.readOnlyLocal = true
            this.previewModeLocal = true
          }, 1);
        }
        : this.closeAction
    }
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
        return details[this.allColumnNames[0]]
      } else {
        return null
      }
    },
    columnsToShow() {
      const columnsToShow = this.previewModeLocal
        ? this.previewColumnNames
        : this.allColumnNames
      // the first attribute reserved for title if specified, so remove from body of card
      // card must also be read-only, since when editing it will be needed in the body
      if (this.options.firstAttrAsCardTitle && this.readOnly) {
        return columnsToShow.slice(1)
      } else {
        return columnsToShow
      }
    },
  },
  methods: {
    handleClick() {
      if (this.onClick) {
        this.onClick(this.collectionName, this.id)
      }
      if (this.expandOnClick) {
        this.readOnlyLocal = false
        this.previewModeLocal = false
      }
    },
    save() {
      alert('not done yet!')
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
}

.sld-card-view.pointer {
  cursor: pointer;
}

.sld-card-view.pointer:hover {
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
}

.sld-card-view input {
  border: none;
  font-size: inherit;
  background-color: transparent;
}

.sld-card-view .controls {
  width: 100%;
  padding-top: 20px;
  font-weight: bold;
  color: grey;
}

.sld-card-view .controls .close {
  cursor: pointer;
}

.sld-card-view .controls .save {
  cursor: pointer;
  float: right;
}

.sld-card-view-details {
  padding-top: 10px;
}
</style>
