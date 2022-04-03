// Global values which are not reactive state

import store from './store/zukunftswerk'

const logo = {
  de: require('../resources/zw-logo.de.png'),
  fr: require('../resources/zw-logo.fr.png')
}
const uiStrings = require('./ui-strings').default
const quillOptions = require('./quill-options').default
const quillOptions2 = {bounds: '.zw-discussion .comments', ...quillOptions}   // Quill instances inside comments-list
                                                                              // need special options
export default {

  logo,
  quillOptions,
  quillOptions2,

  getUser,
  getString,

  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42
}

function getUser (username) {
  return store.state.users.find(ws => ws.value === username)
}

function getString (key) {
  return uiStrings[`${key}.${store.state.lang}`]
}
