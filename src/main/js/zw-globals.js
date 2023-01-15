// Global functions and values (non-reactive)

import Vue from 'vue'
import dmx from 'dmx-api'
import store from './store/zukunftswerk'

const uiStrings = require('./ui-strings').default
const quillOptions = require('./quill-options').default   // Quill config for canvas
const quillOptions2 = dmx.utils.clone(quillOptions)       // Quill config for discussion panel
quillOptions2.bounds = '.zw-discussion .comments'
quillOptions2.modules.toolbar.container[2].splice(2, 1)   // strip "video" button

const logo = {
  de: require('../resources-build/zw-logo.de.png'),
  fr: require('../resources-build/zw-logo.fr.png')
}

const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
console.log('[ZW] isChrome:', isChrome)

export default {

  ITEM_COLORS: [
    'white',
    'rgb(238, 232, 234)',       // lavender
    'rgb(248, 195, 213)',       // red
    'rgb(228, 214, 166)',       // brown
    'rgb(162, 190, 168)',       // green
    'rgb(145, 187, 205)',       // blue
    'transparent'
  ],
  CANVAS_GRID: 20,              // 20x20 pixel = size of grid.png
  CANVAS_BORDER: 40,            // Affects a) position of new items and document revelation, b) zoom-to-fit (in pixel).
                                // Should be a multiple of CANVAS_GRID.
  FORM_WIDTH: 384,              // 360 = width of upload area, +24=2*12 pixel padding   // TODO: proper geometry
  ARROW_GRID: 20,               // TODO: needed?
  ARROW_LENGTH: 200,            // Should be a multiple of CANVAS_GRID
  ARROW_HEIGHT: 40,             // Should be a multiple of CANVAS_GRID

  getLogo,
  getViewport,
  getDisplayName,
  getShowEmailAddress,
  getUser,
  getString,

  findWorkspace,
  sortWorkspaces,

  topicSort,
  canvasFilter,
  confirmDeletion,

  quillOptions,
  quillOptions2,
  isChrome
}

// TODO: make it a store getter?
function getLogo () {
  return logo[store.state.lang]
}

// TODO: make it a store getter?
/**
 * @return  the viewport of the current topicmap (object with "pan" and "zoom" props).
 */
function getViewport() {
  const viewport = getViewportTopic()
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
    const topicmap = store.state.topicmap
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

function getViewportTopic() {
  return store.state.topicmap.topics.find(topic => topic.typeUri === 'zukunftswerk.viewport')
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

/**
 * Finds the given workspace among the current user's workspaces.
 *
 * @return  the workspace (plain topic), or undefined if the given ID does not refer to one of the current user's
 *          workspaces.
 */
function findWorkspace (id) {
  return store.state.workspaces.find(ws => ws.id === id)
}

function sortWorkspaces (topics) {
  return topics.sort((t1, t2) => workspaceName(t1).localeCompare(workspaceName(t2)))
}

function workspaceName (topic) {
  const de = topic.children['dmx.workspaces.workspace_name#zukunftswerk.de']
  const fr = topic.children['dmx.workspaces.workspace_name#zukunftswerk.fr']
  if (de && fr) {
    return topic.children['dmx.workspaces.workspace_name#zukunftswerk.' + store.state.lang].value
  } else if (de) {
    return de.value
  } else {
    return fr.value
  }
}

function topicSort (t1, t2) {
  return t1.value.localeCompare(t2.value)
}

function canvasFilter (topic) {
  return topic.typeUri === 'zukunftswerk.document'  ||
         topic.typeUri === 'zukunftswerk.note'      ||
         topic.typeUri === 'zukunftswerk.textblock' ||
         topic.typeUri === 'zukunftswerk.label'     ||
         topic.typeUri === 'zukunftswerk.arrow'     ||
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
