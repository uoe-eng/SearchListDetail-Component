<template>
  <!-- empty div to hold parent and childern cards -->
  <div>
    <div v-if="!collection">Collection undefined</div>
    <div
      v-else
      class="sld-card-view"
      @keydown="
        (e) => {
          handleKeyDown(e)
        }
      "
      :class="{
        pointer: !isExpanded,
        selected: expanded.id == id,
      }"
      @click="handleClick"
    >
      <span v-if="title != null" class="title">{{ title }}</span>
      <span class="subtitle">{{ type }} / {{ id }}</span>
      <form @submit.prevent="">
        <table class="sld-card-view-details">
          <!-- invisible element that can be tabbed to -->
          <div tabindex="0" @focus="focusTop"></div>
          <tr v-for="column of columnsToShow" :key="column">
            <td class="column">{{ getAlias(column) }}:&nbsp;</td>
            <td class="value">
              <!-- if column is a relationship -->
              <span v-if="column.includes('.')">
                <span
                  v-for="(related, index) in getRelationships(column)"
                  :key="index"
                >
                  <button
                    v-if="getRelatedItem(related, column)"
                    ref="input"
                    @click="addOverlay(related.type, related.id)"
                    :class="{
                      relationship: isExpanded && !shouldShowOverlay,
                      relationshipNoClick: !(isExpanded && !shouldShowOverlay),
                    }"
                  >
                    {{ getRelatedItem(related, column) }}
                  </button>
                  <span v-else>loading...</span>
                  <button
                    class="unlink"
                    @click="handleUnlink(index, column)"
                    v-if="getRelatedItem(related, column) && isExpanded"
                  >
                    ×
                  </button>
                </span>
                <button
                  v-if="isExpanded"
                  class="add"
                  @click="handleAdd(column)"
                >
                  +
                </button>
              </span>
              <!-- if column is read only - read only is overruled if there is an overlay -->
              <span v-else-if="isReadOnly || expanded.overlay">
                {{ entry[column] }}
              </span>
              <!-- otherwise column is editable -->
              <input v-else ref="input" type="text" v-model="entry[column]" />
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
        <!-- invisible element that can be tabbed to -->
        <div tabindex="0" @focus="focusBottom"></div>
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
import util from './util'

export default {
  name: 'CardView',
  props: {
    localstore: Object,
    type: String, // type of entry in collection
    id: String, // id of entry in collection
    isReadOnly: Boolean,
    isExpanded: Boolean,
    // must stay as prop (not in store) since the value is modified in a recursive call
    expanded: Object,
  },
  data() {
    return {
      // defined here so the template can use it
      config: config,
    }
  },
  computed: {
    entry() {
      return util.getEntry(this.$store, this.type, this.id)
    },

    page() {
      return this.localstore.state.page
    },

    collection() {
      return util.getCollection(this.localstore, this.type)
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
      if (config.FIRST_COL_AS_CARD_TITLE) {
        if (this.isExpanded) {
          return this.entry[this.collection.options.columns[0].name]
        } else {
          return this.entry[this.collection.options.previewOrder[0]]
        }
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
        (config.FIRST_COL_AS_CARD_TITLE && this.isReadOnly)
      ) {
        // take all columns except the first
        return columnsToShow.slice(1)
      } else {
        return columnsToShow
      }
    },

    topTable() {
      return this.localstore.state.topTableInstance
    },

    bottomTable() {
      return this.localstore.state.bottomTableInstance
    },
  },
  methods: {
    // creates a child card on top of this
    addOverlay(type, id) {
      // don't allow adding overlays if an overlay is already showing
      if (this.shouldShowOverlay) return
      this.localstore.state.expansionState.addOverlay(this.page, type, id)
    },

    getAlias(column) {
      return util.getColumnAlias(this.collection, column)
    },

    getEntries(collectionName) {
      return util.getEntries(this.$store, collectionName)
    },

    // returns an array of {id, type} for the related entries of this card
    getRelationships(relationshipColumn) {
      return util.getRelatedEntries(this.entry, relationshipColumn)
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
      util.log('closing card')
      // don't allow closing when showing overlay
      if (this.shouldShowOverlay) return
      // settimeout to let the click event finish, so it won't reclick when closed
      setTimeout(() => {
        // remove the top child card
        this.localstore.state.expansionState.removeOverlay(this.page)
        this.topTable && this.topTable.selectCell(0, 0)
      }, 0)
    },
    handleSave() {
      util.log('saving card')
      // don't allow saves when showing an overlay
      if (this.shouldShowOverlay) return

      // v-model will already update the values of the entry in the search results
      // so just call a patch which will use the updated values in the search results
      const cleanEntry = util.cleanEntry(this.entry)
      util.log('cleanEntry', cleanEntry)
      this.localstore.dispatch('patch', cleanEntry)
      this.localstore.state.expansionState.removeOverlay(this.page)
    },

    // when the top invisible element is tabbed to, focus the top table
    focusTop() {
      if (this.topTable === undefined) return
      this.topTable.selectCell(
        this.topTable.countRows() - 1,
        this.topTable.countCols() - 1
      )
    },

    // when the bottom invisible element is tabbed to, focus the bottom table
    focusBottom() {
      if (this.bottomTable === undefined) return
      this.bottomTable.selectCell(0, 0)
    },

    // handles keypresses from the input boxes
    handleKeyDown(e) {
      const isEnter = e.key == 'Enter'
      const isEscape = e.key == 'Escape'

      if (isEnter) {
        this.handleSave()
      }
      if (isEscape) {
        this.handleClose()
      }
    },

    // the relationship tables need to be set to nullable, so that a
    // relationship can be removed from an object without breaking the table
    handleUnlink(index, fromCol) {
      util.log('unlink', index, fromCol)
      const rels = this.getRelationships(fromCol)
      const newRels = rels.filter((rel, pos) => pos !== index)

      const relName = fromCol.split('.')[0]
      this.entry._jv.relationships[relName].data = newRels
      this.$store.dispatch('jv/patch', this.entry).then(() => {
        util.log('finished unlinking')
        this.localstore.dispatch('updateSearchResults')
      })
    },

    handleAdd(fromCol) {
      util.log('add relationship to', fromCol)
      const rels = this.getRelationships(fromCol)

      // temporary solution to add different entries
      const type = window.prompt('Collection type')
      const id = window.prompt('Entry ID')

      const newRels = rels.concat({ id: id, type: type })

      const relName = fromCol.split('.')[0]
      this.entry._jv.relationships[relName].data = newRels
      this.$store.dispatch('jv/patch', this.entry).then(() => {
        util.log('finished adding link')
        this.localstore.dispatch('updateSearchResults')
      })
    },

    getRelatedItem(related, column) {
      const entry = util.getEntry(this.$store, related.type, related.id)
      return entry && entry[column.split('.')[1]]
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

.sld-card-view button.relationship,
button.unlink,
button.add {
  padding: 7px;
  margin: 5px;
  border: 1px var(--alt-text-color) solid;
  border-radius: 3px;
  background-color: var(--light-card);
  cursor: pointer;
}

.sld-card-view button.relationship:hover,
button.unlink:hover,
button.add:hover {
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
