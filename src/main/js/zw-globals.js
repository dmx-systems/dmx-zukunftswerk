// Global functions and values (non-reactive)

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

const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
console.log('[ZW] isChrome:', isChrome)

export default {

  getLogo,
  getViewport,
  getDisplayName,
  getShowEmailAddress,
  getUser,
  getString,

  findWorkspace,
  isValidWorkspaceId,

  topicSort,
  canvasFilter,
  confirmDeletion,

  quillOptions,
  quillOptions2,
  isChrome,

  NOTE_COLORS: [
    'white',
    'rgb(238, 232, 234)',
    'rgb(248, 195, 213)',
    'rgb(228, 214, 166)',
    'rgb(162, 190, 168)',
    'rgb(145, 187, 205)',
    'transparent'
  ],
  CANVAS_BORDER: 42,            // affects a) position of new items and document revelation, b) zoom-to-fit (in pixel)
  FORM_WIDTH: 384,              // 360=width of upload area, +24=2*12 pixel padding   // TODO: proper geometry
  ARROW_LENGTH: 200,
  ARROW_HEIGHT: 30
}

// TODO: make it a store getter?
function getLogo () {
  return logo[store.state.lang]
}

// TODO: make it a store getter?
/**
 * @return  the viewport of the current topicmap.
 */
function getViewport() {
  const viewport = store.state.topicmap.topics.find(t => t.typeUri === 'zukunftswerk.viewport')
  if (viewport) {
    const zoom = viewport.viewProps['dmx.topicmaps.zoom']
    return {
      pan: {
        x: -viewport.pos.x * zoom,
        y: -viewport.pos.y * zoom
      },
      zoom
    }
  } else {
    // fallback
    console.warn(`Viewport topic missing in Topicmap ${topicmap.id}`)
    return {
      pan: {
        x: topicmap.panX,
        y: topicmap.panY
      },
      zoom: topicmap.zoom
    }
  }
}

function getDisplayName (username) {
  return getUser(username).children['dmx.signup.display_name']?.value || '?'
}

function getShowEmailAddress (username) {
  return getUser(username).children['zukunftswerk.show_email_address'].value
}

function getUser (username) {
  const _username = username.toLowerCase()
  return store.state.users.find(user => user.value === _username)
}

function getString (key) {
  return uiStrings[`${key}.${store.state.lang}`]
}

function findWorkspace (id) {
  return store.state.workspaces.find(ws => ws.id === id)
}

/**
 * @param   id    if undefined false is returned
 */
function isValidWorkspaceId (id, origin) {
  if (!id) {
    return false
  }
  const valid = store.state.isTeam && id === store.state.teamWorkspace.id || findWorkspace(id)
  // console.log('isValidWorkspaceId', id, '(from ' + origin + ')', !!valid)
  if (!valid) {
    console.warn(`${id} is an invalid workspace ID for user "${store.state.username}"`)
  }
  return valid
}

function topicSort (t1, t2) {
  return t1.value.localeCompare(t2.value)
}

function canvasFilter (topic) {
  return topic.typeUri === 'zukunftswerk.document' ||
         topic.typeUri === 'zukunftswerk.note'     ||
         topic.typeUri === 'zukunftswerk.label'    ||
         topic.typeUri === 'zukunftswerk.arrow'    ||
         topic.typeUri === 'zukunftswerk.viewport' && (store.state.isTeam || store.state.isEditor)
}

function confirmDeletion (textKey = 'warning.delete') {
  return Vue.prototype.$confirm(getString(textKey), {
    type: 'warning',
    title: getString('label.warning'),
    confirmButtonText: getString('action.delete'),
    confirmButtonClass: 'el-button--danger',
    cancelButtonText: getString('action.cancel'),
    showClose: false
  })
}
