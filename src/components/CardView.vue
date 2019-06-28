<template>
  <!-- empty div to hold parent and childern cards -->
  <div>
    <div
      class="sld-card-view"
      v-bind:class="{
        pointer: !isExpanded,
        selected: expanded.id == id,
      }"
      @click="handleClick"
    >
      <span v-if="title != null" class="title">{{ title }}</span>
      <span class="subtitle">{{ type }} / {{ id }}</span>
      <form v-on:submit.prevent="handleSave">
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
                    @click="addOverlay(related.type, related.id)"
                    class="relationship"
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
              <span v-else-if="isReadOnly || expanded.overlay">
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
      <div class="controls" v-if="!isReadOnly && !expanded.overlay">
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
    <!-- child card for when there are overlays -->
    <CardView
      v-if="shouldShowOverlay"
      :type="expanded.overlay.type"
      :id="expanded.overlay.id"
      :isReadOnly="false"
      :isExpanded="true"
      :expanded="expanded.overlay"
    ></CardView>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'CardView',
  props: {
    type: String, // type of entry in collection
    id: String, // id of entry in collection
    isReadOnly: Boolean,
    isExpanded: Boolean,
    onTabOutUp: {
      type: Function,
      default: () => {},
    },
    onTabOutDown: {
      type: Function,
      default: () => {},
    },
    // must stay as prop (not in store) since the value is modified in a recursive call
    expanded: Object,
  },
  data() {
    return {
      // defined here so the template can use it
      config: config,
      // create a deep copy since the user will want to explicitly save
      collections: JSON.parse(
        JSON.stringify(this.$store.state.sld.collections)
      ),
    }
  },
  computed: {
    page() {
      return this.$store.state.sld.page
    },
    collection() {
      return this.collections[this.type]
    },
    entry() {
      return this.collection.entries[this.id]
    },
    // boolean to determine if there are overlays to be displayed
    shouldShowOverlay() {
      return (
        this.expanded.overlay != undefined &&
        this.expanded.type == this.type &&
        this.expanded.id == this.id
      )
    },
    // the string for the title of the card (null if titles are disabled)
    title() {
      // don't set the title unless specified
      if (this.$store.state.sld.componentOptions.firstAttrAsCardTitle) {
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
        this.isExpanded && !this.expanded.overlay
          ? this.collection.fullCols
          : this.collection.previewCols
      // the first attribute is reserved for the title if specified, so remove it from body of card
      // card must also be read-only, since when editing it will be needed in the body
      if (
        this.expanded.overlay ||
        (this.$store.state.sld.componentOptions.firstAttrAsCardTitle &&
          this.isReadOnly)
      ) {
        // take all columns except the first
        return columnsToShow.slice(1)
      } else {
        return columnsToShow
      }
    },
  },
  // focus on the first input box when the card is created
  created() {
    this.focusFirstInputBox()
  },
  methods: {
    // creates a child card on top of this
    addOverlay(type, id) {
      this.$store.dispatch('addOverlay', {
        type: type,
        id: id,
      })
    },
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
        // relData is not put in an array if there is only one
        return [relData]
      }
    },
    handleClick() {
      if (!this.isExpanded) {
        // determine if the page should be changed somewhere else
        const pageToNavTo = this.$store.state.sld.componentOptions.mobile
          ? this.$store.state.sld.page // current page
          : this.type // page for the type of card
        this.$store.dispatch('setExpanded', {
          page: pageToNavTo,
          type: this.type,
          id: this.id,
        })

        // then switch to that page
        this.$store.dispatch('setPage', pageToNavTo)
      }
    },
    handleClose() {
      // remove the top child card
      this.$store.dispatch('removeOneOverlay')
    },
    handleSave() {
      const record = this.collections[this.type].entries[this.id]
      // patch the modified record up to the server
      this.$store.dispatch('jv/patch', record)
      // this.$store.dispatch('setCollection', this.collections[this.type])
      this.$store.dispatch('updateEntry', {
        newEntry: this.entry,
        type: this.type,
        id: this.id,
      })
      // remove the top child card
      this.$store.dispatch('removeOneOverlay')
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
  background-color: var(--light-card);
  padding: 10px;
  border: 1px #cdcdcd solid;
  border-radius: 3px;
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

.sld-card-view button.relationship {
  padding: 7px;
  margin: 5px;
  border: 1px var(--alt-text-color) solid;
  border-radius: 3px;
  background-color: var(--light-card);
  cursor: pointer;
  font-weight: bold;
  font-style: italic;
}

.sld-card-view button.relationship:hover {
  background-color: var(--highlight-color);
}

.sld-card-view input {
  border: none;
  border-bottom: 1px var(--alt-text-color) solid;
  outline: none;
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
