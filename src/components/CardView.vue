<template>
  <div
    class="sld-card-view"
    v-bind:class="{ pointer: onClick && !isExpanded }"
    @click="handleClick"
  >
    <span v-if="title != null" class="title">{{ title }}</span>
    <span class="subtitle">{{ collection.type }} / {{ id }}</span>
    <form v-on:submit.prevent="save">
      <table class="sld-card-view-details">
        <tr v-for="(column, index) of columnsToShow" v-bind:key="column">
          <td class="column">{{ column }}:</td>
          <td class="value">
            <span v-if="isReadOnly">{{ entry[column] }}</span>
            <input
              v-else
              @keydown="
                (e) => {
                  handleKeyDown(e, index)
                }
              "
              ref="input"
              type="text"
              v-model="entry[column]"
            />
          </td>
        </tr>
      </table>
    </form>
    <div class="controls" v-if="!isReadOnly">
      <span
        class="close"
        :ref="config.CLOSE_BUTTON_REF"
        tabIndex="0"
        @click="handleClose"
      >
        {{ config.CLOSE_BUTTON_TEXT }}
      </span>
      <span
        class="save"
        :ref="config.SAVE_BUTTON_REF"
        tabindex="0"
        @click="handleSave"
      >
        {{ config.SAVE_BUTTON_TEXT }}
      </span>
    </div>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'CardView',
  props: {
    collection: Object,
    id: String, // id of row in collection
    page: String, // page on which this card is showing
    isReadOnly: Boolean,
    isExpanded: Boolean,
    onClick: Function,
    onClose: Function,
    onSave: Function,
    onTabOutUp: {
      type: Function,
      default: () => {},
    },
    onTabOutDown: {
      type: Function,
      default: () => {},
    },
    componentOptions: Object,
  },
  data() {
    return {
      config: config,
      entry: this.collection.entries[this.id],
    }
  },
  computed: {
    // the string for the title of the card (null if titles are disabled)
    title() {
      // don't set the title unless specified
      if (this.componentOptions.firstAttrAsCardTitle) {
        return this.entry[this.collection.fullCols[0]]
      } else {
        return null
      }
    },
    // the columns that will show in the body of the card
    columnsToShow() {
      // choose the columns to display, expanded means show all columns
      const columnsToShow = this.isExpanded
        ? this.collection.fullCols
        : this.collection.previewCols
      // the first attribute is reserved for the title if specified, so remove it from body of card
      // card must also be read-only, since when editing it will be needed in the body
      if (this.componentOptions.firstAttrAsCardTitle && this.isReadOnly) {
        return columnsToShow.slice(1)
      } else {
        return columnsToShow
      }
    },
  },
  created() {
    this.focusFirstInputBox()
  },
  methods: {
    handleClick() {
      if (this.onClick) {
        this.onClick(this.collection.type, this.id, this.page)
      }
    },
    handleClose() {
      if (this.onClose) {
        this.onClose(this.collection.type, this.id, this.page)
      }
    },
    handleSave() {
      if (this.onSave) {
        this.onSave(this.collection.type, this.id, this.page)
      }
    },
    // handles keypresses from the input boxes
    handleKeyDown(e, index) {
      const isFirst = index == 0
      const isLast = index == this.collection.fullCols.length - 1
      const isTabForward = e.key == 'Tab' && !e.shiftKey
      const isTabBackward = e.key == 'Tab' && e.shiftKey
      const isEnter = e.key == 'Enter'
      const isEscape = e.key == 'Escape'
      // tab out of the card upwards
      if (isFirst && isTabBackward) {
        e.preventDefault()
        this.onTabOutUp()
      }
      // tab out of the card downwards
      if (isLast && isTabForward) {
        e.preventDefault()
        this.onTabOutDown()
      }
      if (isEnter) {
        this.handleSave()
      }
      if (isEscape) {
        this.handleClose()
      }
    },
    focusFirstInputBox() {
      // wait for the card to load into the DOM
      this.$nextTick(() => {
        const inputs = this.$refs.input
        if (inputs && inputs.length > 0) {
          inputs[0].focus()
        }
      })
    },
  },
}
</script>

<style scoped>
.sld-card-view {
  padding: 10px;
  /* margin: 10px; */
  border: 1px #cdcdcd solid;
  border-radius: 1px;
  /* box-shadow: rgba(0, 0, 0, 0.3) 0 1px 3px; */
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
