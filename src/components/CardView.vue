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
        <tr v-for="(column, index) of columnsToShow" v-bind:key="column">
          <td class="column">{{ column }}:</td>
          <td class="value">
            <span v-if="readOnlyLocal">{{ details[column] }}</span>
            <!-- listener here -->
            <input
              v-else
              @keydown="
                (e) => {
                  handleKeyDown(e, index)
                }
              "
              ref="input"
              type="text"
              v-model="details[column]"
            />
          </td>
        </tr>
      </table>
    </form>
    <div class="controls" v-if="!readOnlyLocal">
      <span class="close" ref="close" tabIndex="0" @click="closeActionLocal">
        Close
      </span>
      <span class="save" ref="save" tabindex="0" @click="save">Save</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardView',
  props: {
    collection: Object,
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
      details: this.collection[this.id],
    }
  },
  computed: {
    title() {
      // don't set the title unless specified
      if (this.globalOptions.firstAttrAsCardTitle) {
        return this.details[this.allColumnNames[0]]
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
  created() {
    this.focusFirstInputBox()
  },
  updated() {
    this.focusFirstInputBox()
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
    handleKeyDown(e, index) {
      const isFirst = index == 0
      const isLast = index == this.allColumnNames.length - 1
      const isTabForward = e.key == 'Tab' && !e.shiftKey
      const isTabBackward = e.key == 'Tab' && e.shiftKey
      if (isFirst && isTabBackward) {
        e.preventDefault()
        this.onTabOutUp()
      }
      if (isLast && isTabForward) {
        e.preventDefault()
        this.onTabOutDown()
      }
    },
    save() {
      // (?) not sure how this works
      this.patchRecord(this.details)
    },
    collapseCard() {
      // really hacky, but the handleClick function always runs after this,
      // which means that the card closes then opens again.
      // the timeout makes this run after handleClick
      setTimeout(() => {
        this.readOnlyLocal = true
        this.previewModeLocal = true
      }, 0)
    },
    focusFirstInputBox() {
      this.$nextTick(() => {
        const inputs = this.$refs.input
        if (inputs && inputs.length > 0) {
          inputs[0].focus()
        }
      })
    },
    patchRecord(record) {
      this.$store.dispatch('jv/patch', record)
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
