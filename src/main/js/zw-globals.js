// Global functions and values (not reactive)

import Vue from 'vue'
import dmx from 'dmx-api'
import store from './store/zukunftswerk'

const uiStrings = require('./ui-strings').default
const quillOptions = require('./quill-options').default   // Quill config for canvas
const quillOptions2 = dmx.utils.clone(quillOptions)       // Quill config for discussion panel
quillOptions2.bounds = '.zw-discussion .comments'
quillOptions2.modules.toolbar.container[4].splice(2, 1)   // strip "video" button

const logo = {
  de: require('../resources-build/zw-logo.de.png'),
  fr: require('../resources-build/zw-logo.fr.png')
}

export default {

  getDisplayName,
  getUser,
  getString,
  getLogo,

  topicSort,
  confirmDeletion,

  quillOptions,
  quillOptions2,

  NOTE_COLORS: [
    'white',
    'rgb(238, 232, 234)',
    'rgb(248, 195, 213)',
    'rgb(228, 214, 166)',
    'rgb(162, 190, 168)',
    'rgb(145, 187, 205)',
    'transparent'
  ],
  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42,
  FORM_WIDTH: 384               // 360=width of upload area, +24=2*12 pixel padding   // TODO: proper geometry
}

function getDisplayName (username) {
  return getUser(username).children['zukunftswerk.display_name']?.value || '?'     // TODO
}

function getUser (username) {
  return store.state.users.find(ws => ws.value === username)
}

function getString (key) {
  return uiStrings[`${key}.${store.state.lang}`]
}

function getLogo () {
  return logo[store.state.lang]
}

function topicSort (t1, t2) {
  return t1.value.localeCompare(t2.value)
}

function confirmDeletion (textKey = 'warning.delete') {
  return Vue.prototype.$confirm(getString(textKey), 'Warning', {
    type: 'warning',
    confirmButtonText: getString('action.delete'),
    confirmButtonClass: 'el-button--danger',
    showClose: false
  })
}
