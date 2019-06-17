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
            <input ref="input" type="text" v-else v-model="details[column]" />
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
    globalOptions: Object,
    readOnly: Boolean,
    previewMode: Boolean,
    expandOnClick: Boolean,
    onClick: Function,
    closeAction: Function,
    onTabOutUp: {
      type: Function,
      default: () => {},
    },
    onTabOutDown: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      // save as local data so that it can be modified dynamically
      readOnlyLocal: this.readOnly,
      previewModeLocal: this.previewMode,
      closeActionLocal: this.expandOnClick
        ? this.collapseCard
        : this.closeAction,
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
      if (this.globalOptions.firstAttrAsCardTitle) {
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
      if (this.globalOptions.firstAttrAsCardTitle && this.readOnly) {
        return columnsToShow.slice(1)
      } else {
        return columnsToShow
      }
    },
  },
  updated() {
    this.addKeyboardControls()
  },
  created() {
    this.addKeyboardControls()
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
    collapseCard() {
      // really hacky, but the handleClick function always runs after this,
      // which means that the card closes then opens again.
      // the timeout makes this run after handleClick
      setTimeout(() => {
        this.readOnlyLocal = true
        this.previewModeLocal = true
      }, 1)
    },
    addKeyboardControls() {
      this.$nextTick(() => {
        if (!this.$refs.input || this.$refs.input.length <= 0) {
          return
        }
        const inputBoxes = this.$refs.input

        // focus on the first input box
        inputBoxes[0].focus()
        // add listener to the first input box to tab out upwards
        inputBoxes[0].addEventListener('keydown', (e) => {
          if (e.key == 'Tab' && e.shiftKey) {
            // prevent default here doesn't prevent the tabbing on the tables
            // e.preventDefault()
            this.onTabOutUp(e)
          }
        })

        // add listener to the last input box to tab out downwards
        inputBoxes[inputBoxes.length - 1].addEventListener('keydown', (e) => {
          e.preventDefault()
          if (e.key == 'Tab' && !e.shiftKey) {
            this.onTabOutDown(e)
          }
        })
      })
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
