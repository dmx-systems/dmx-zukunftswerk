// Global values which are not reactive state

import store from './store/zukunftswerk'

const uiStrings = require('./ui-strings').default
const quillOptions = require('./quill-options').default
const quillOptions2 = {bounds: '.zw-discussion .comments', ...quillOptions}   // Quill instances inside comments-list
                                                                              // need special options
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

  quillOptions,
  quillOptions2,

  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42
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
