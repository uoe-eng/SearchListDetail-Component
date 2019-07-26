<template>
  <!-- empty div to hold parent and childern cards -->
  <div>
    <div
      class="sld-card-view"
      :class="{
        pointer: !isExpanded,
        selected: expanded.id == id,
      }"
      @click="handleClick"
    >
      <span v-if="title != null" class="title">{{ title }}</span>
      <span class="subtitle">{{ type }} / {{ id }}</span>
      <form v-on:submit.prevent="handleSave">
        <table class="sld-card-view-details">
          <tr v-for="(column, index) of columnsToShow" :key="column">
            <td class="column">{{ collection.getAlias(column) }}:&nbsp;</td>
            <td class="value">
              <!-- if column is a relationship -->
              <span v-if="column.includes('.')">
                <span
                  v-for="(related, index) in getRelationships(column)"
                  :key="index"
                >
                  <button
                    @click="addOverlay(related.type, related.id)"
                    :class="{
                      relationship: isExpanded && !shouldShowOverlay,
                      relationshipNoClick: !(isExpanded && !shouldShowOverlay),
                    }"
                  >
                    {{
                      localstore.state
                        .getCollection(related.type)
                        .get(related.id)[column.split('.')[1]]
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
      class="overlay"
      :localstore="localstore"
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
    localstore: Object,
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
      old: this.localstore.state.getCollection(this.type).get(this.id, true),
    }
  },
  computed: {
    page() {
      return this.localstore.state.page
    },
    collection() {
      return this.localstore.state.getCollection(this.type)
    },
    entry() {
      return this.collection.get(this.id)
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
      if (this.localstore.state.sldProp.firstAttrAsCardTitle) {
        return this.entry[this.collection.options.columns[0].name]
      } else {
        return null
      }
    },

    // the columns that will show in the body of the card
    columnsToShow() {
      // choose the columns to display, expanded means show all columns
      const columnsToShow =
        this.isExpanded && !this.expanded.overlay
          ? this.collection.columnNames
          : this.collection.options.previewOrder

      // the first attribute is reserved for the title if specified, so remove it from body of card
      // card must also be read-only, since when editing it will be needed in the body
      if (
        this.expanded.overlay ||
        (this.localstore.state.sldProp.firstAttrAsCardTitle && this.isReadOnly)
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
      // don't allow adding overlays if an overlay is already showing
      if (this.shouldShowOverlay) return
      this.localstore.state.expansionState.addOverlay(this.page, type, id)
    },

    // returns an array of {id, type} for the related entries of this card
    getRelationships(relColumn) {
      const relName = relColumn.split('.')[0]
      if (!this.entry._jv.relationships) return []
      const relData = this.entry._jv.relationships[relName].data
      if (Array.isArray(relData)) {
        return relData
      } else {
        // relData is not put in an array if there is only one
        return [relData]
      }
    },

    handleClick() {
      if (this.isExpanded) return

      // determine if the page should be changed somewhere else
      const pageToNavTo = this.localstore.state.mobile
        ? this.localstore.state.page // current page
        : this.type // page for the type of card

      this.localstore.state.expansionState.setExpanded(
        pageToNavTo,
        this.type,
        this.id
      )

      // then switch to that page
      this.localstore.dispatch('setPage', pageToNavTo)
    },
    handleClose() {
      // don't allow closing when showing overlay
      if (this.shouldShowOverlay) return
      // settimeout to let the click event finish, so it won't reclick when closed
      setTimeout(() => {
        this.collection.searchResults[this.id] = this.old
        // remove the top child card
        this.localstore.state.expansionState.removeOverlay(this.page)
      }, 0)
    },
    handleSave() {
      // don't allow saves when showing an overlay
      if (this.shouldShowOverlay) return

      // v-model will already update the values of the entry in the search results
      // so just call a patch which will use the updated values in the search results
      this.collection.patch(this.id)
      this.localstore.state.expansionState.removeOverlay(this.page)
    },

    // handles keypresses from the input boxes
    handleKeyDown(e, index) {
      const isFirst = index == 0
      const isLast = index == this.collection.options.columns.length - 1
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
        // grab a list of dom elements
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

.sld-card-view button {
  font-size: inherit;
}

.sld-card-view button.relationship {
  padding: 7px;
  margin: 5px;
  border: 1px var(--alt-text-color) solid;
  border-radius: 3px;
  background-color: var(--light-card);
  cursor: pointer;
}

.sld-card-view button.relationship:hover {
  background-color: var(--highlight-color);
}

.sld-card-view button.relationshipNoClick {
  background-color: transparent;
  border: none;
  outline: none;
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
