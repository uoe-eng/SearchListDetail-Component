<template>
  <div>
    <div
      class="sld-card-view"
      v-bind:class="{
        pointer: onClick && !isExpanded,
        selected: expandedID.id == id
      }"
      @click="handleClick"
    >
      <span v-if="title != null" class="title">{{ title }}</span>
      <span class="subtitle">{{ type }} / {{ id }}</span>
      <form v-on:submit.prevent="save">
        <table class="sld-card-view-details">
          <tr v-for="(column, index) of columnsToShow" v-bind:key="column">
            <td class="column">{{ column }}:&nbsp;</td>
            <td class="value">
              <!-- if column is a relationship -->
              <span v-if="column.includes('.')">
                <span
                  v-for="(related, index) in getRelationships(column)"
                  v-bind:key="index"
                >
                  <button
                    @click="addOverlay(expandedID, related.type, related.id)"
                  >
                    {{
                      collections[related.type].entries[related.id][
                        column.split('.')[1]
                      ]
                    }}
                  </button>
                </span>
              </span>
              <!-- if column is read only - read only is overruled if there is an overlay -->
              <span v-else-if="isReadOnly || expandedID.overlay">
                {{ entry[column] }}
              </span>
              <!-- otherwise column is editable -->
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
      <div class="controls" v-if="!isReadOnly && !expandedID.overlay">
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
    <CardView
      v-if="
        expandedID.overlay && expandedID.type == type && expandedID.id == id
      "
      :collections="collections"
      :type="expandedID.overlay.type"
      :id="expandedID.overlay.id"
      :page="page"
      :onClick="onClick"
      :onClose="onClose"
      :onSave="onSave"
      :isReadOnly="false"
      :isExpanded="true"
      :expandedID="expandedID.overlay"
      :addOverlay="addOverlay"
      :componentOptions="componentOptions"
    ></CardView>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'CardView',
  props: {
    collections: Object,
    type: String,
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
    expandedID: Object,
    addOverlay: Function,
    componentOptions: Object,
  },
  data() {
    return {
      // defined here so the template can use it
      config: config,
      collection: this.collections[this.type],
      entry: this.collections[this.type].entries[this.id],
      // stringify to create deep copy
      oldDetails: JSON.stringify(this.collections[this.type].entries[this.id]),
    }
  },
  computed: {
    // the string for the title of the card (null if titles are disabled)
    title() {
      // don't set the title unless specified
      if (this.componentOptions.firstAttrAsCardTitle) {
        const entry = this.collection.entries[this.id]
        return entry[this.collection.fullCols[0]]
      } else {
        return null
      }
    },
    // the columns that will show in the body of the card
    columnsToShow() {
      // choose the columns to display, expanded means show all columns
      const columnsToShow =
        this.isExpanded && !this.expandedID.overlay
          ? this.collection.fullCols
          : this.collection.previewCols
      // the first attribute is reserved for the title if specified, so remove it from body of card
      // card must also be read-only, since when editing it will be needed in the body
      if (this.componentOptions.firstAttrAsCardTitle && this.isReadOnly || this.expandedID.overlay) {
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
    // returns an array of {id, type} for the related entries of this card
    getRelationships(relColumn) {
      const relName = relColumn.split('.')[0]
      if (!this.entry._jv.relationships) {
        return []
      }
      const relData = this.entry._jv.relationships[relName].data
      if (Array.isArray(relData)) {
        return relData
      } else {
        return [relData]
      }
    },
    handleClick() {
      if (this.onClick && !this.isExpanded) {
        this.onClick(this.collection.type, this.id, this.page)
      }
    },
    handleClose() {
      if (this.onClose) {
        // restore the old deatils from when the card was rendered
        const oldDetails = JSON.parse(this.oldDetails)
        this.collection.entries[this.id] = oldDetails
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
  border: 1px #cdcdcd solid;
  border-radius: 1px;
  max-width: var(--card-width);
}

.sld-card-view.pointer {
  cursor: pointer;
}

.sld-card-view.pointer:hover {
  background-color: var(--highlight-color);
}

.sld-card-view.selected {
  background-color: var(--highlight-color);
}

.sld-card-view .column {
  color: var(--alt-text-color);
}

.sld-card-view .title {
  padding-right: 10px;
  font-size: larger;
  font-weight: bold;
}

.sld-card-view .subtitle {
  color: var(--alt-text-color);
}

.sld-card-view input {
  border: none;
  font-size: inherit;
  background-color: transparent;
  width: 100%;
}

.sld-card-view .controls {
  width: 100%;
  padding-top: 20px;
  font-weight: bold;
  color: var(--alt-text-color);
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
