import Vue from 'vue'
import config from './config'
import util from './util'

export default class ExpansionState {
  constructor(collectionNames) {
    this[config.ALL_PAGE_NAME] = {}
    collectionNames.forEach((page) => {
      this[page] = {}
    })
  }

  setExpanded(page, type, id) {
    util.log('setting expansion for', page, type, id)
    Vue.set(this, page, {
      type: type,
      id: id,
    })
  }

  addOverlay(page, type, id) {
    util.log('adding overlay to page', page, 'data:', type, id)
    const addOverlayToDeepestOverlay = (overlay, type, id) => {
      if (overlay.overlay) {
        addOverlayToDeepestOverlay(overlay.overlay, type, id)
      } else {
        Vue.set(overlay, 'overlay', {
          type: type,
          id: id,
        })
      }
    }
    addOverlayToDeepestOverlay(this[page], type, id)
  }

  removeOverlay(page) {
    util.log('removing overlay from page', page)
    if (!this[page].overlay) {
      Vue.set(this, page, {})
      return
    }
    const removeDeepestOverlay = (overlay) => {
      // if the overlay has an overlay then skip deleting this overlay and recurse to the next
      if (overlay.overlay.overlay) {
        removeDeepestOverlay(overlay.overlay)
      } else {
        Vue.delete(overlay, 'overlay')
      }
    }
    removeDeepestOverlay(this[page])
  }
}
