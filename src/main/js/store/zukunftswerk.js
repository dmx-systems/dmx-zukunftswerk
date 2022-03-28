import Vue from 'vue'
import Vuex from 'vuex'
import {MessageBox} from 'element-ui'
import http from 'axios'
import dmx from 'dmx-api'
import adminStore from './admin'

window.addEventListener('focus', updateWorkspaceCookie)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team', true)      // includeChildren=true
const ready = dmx.rpc.getUsername().then(initUserState)
const width = window.innerWidth

const state = {

  teamWorkspace,                // a promise, resolved with the "Team" Workspace topic (dmx.Topic)
  ready,                        // a promise, resolved once User state is initialized

  // User state
  username: '',                 // username of current user (String), empty/undefined if not logged in
  workspaces: [],               // ZW shared workspaces of the current user (array of plain Workspace topics)
  isTeam: false,                // true if the "Team" workspace is writable by the current user (Boolean)
  users: [],                    // all users in the system (array of plain Username topics)

  // Workspace state
  topicmap: undefined,          // the topicmap displayed on canvas (dmx.Topicmap)
  workspace: undefined,         // the workspace the topicmap belongs to (dmx.Topic)
  isWritable: false,            // true if the workspace is writable by the current user (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  isEditActive: [],             // IDs of topics being edited (array)     // ### TODO: drop this, query model ID instead
  pan: {x: 0, y: 0},            // canvas pan (in pixel)                  // ### TODO: drop this, calculate instead
  zoom: 1,                      // canvas zoom (Number)                   // ### TODO: drop this, calculate instead
  isDragging: false,            // true while any of the 4 dragging actions is in progress (item move, item resize,
                                // canvas pan, panel resize)
  fullscreen: false,            // if true the current document is rendered fullscreen

  // Discussion Panel state
  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * width,         // x coordinate in pixel (Number)         // ### TODO: rename to "canvasWidth"?
  discussion: undefined,        // the comments displayed in discussion panel (array of dmx.RelatedTopic)
  refDocument: undefined,       // document the new comment relates to (a Document topic, plain object)
  downloadUrl: undefined,       // URL of previously downloaded comment attachment

  // Misc state
  logo: {
    de: require('../../resources/logo.de.png'),
    fr: require('../../resources/logo.fr.png')
  },
  lang: 'de',                   // UI language ('de'/'fr')
  uiStrings:    require('../ui-strings').default,
  quillOptions: require('../quill-options').default,

  getUser,
  getString,

  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42
}

const actions = {

  login ({dispatch}, credentials) {
    return dmx.rpc.login(credentials, 'Basic').then(username => {     // TODO: LDAP login
      DEV && console.log('[ZW] Login', username)
      return initUserState(username)
    }).then(() =>
      dispatch('getInitialWorkspaceId')
    ).then(workspaceId =>
      dispatch('callWorkspaceRoute', workspaceId)
    )
  },

  logout ({dispatch}) {
    DEV && console.log('[ZW] Logout', state.username)
    dmx.rpc.logout()
    initUserState()
    dispatch('callLoginRoute')
  },

  resetPassword (_, emailAddress) {
    http.get(`/sign-up/password-token/${emailAddress}/%2f`).then(response => {    // redirectUrl=/ (%2f)
      console.log('resetPassword', response.data)
    })
  },

  fetchAllUsers () {
    if (!state.users.length) {
      return http.get('/zukunftswerk/admin/users').then(response => {
        state.users = response.data.sort(
          (u1, u2) => u1.value.localeCompare(u2.value)
        )
      })
    } else {
      return Promise.resolve()
    }
  },

  getInitialWorkspaceId () {
    return dmx.isAdmin().then(isAdmin => {
      if (isAdmin) {
        return state.teamWorkspace.then(workspace => {
          return workspace.id
        })
      } else {
        return state.workspaces[0].id
      }
    })
  },

  setLang (_, lang) {
    state.lang = lang
  },

  setWorkspace (_, workspaceId) {
    if (!workspaceId) {
      throw Error(`${workspaceId} is not a workspace ID`)
    }
    dmx.rpc.getTopic(workspaceId, true).then(workspace => {           // includeChildren=true
      if (workspace.typeUri !== 'dmx.workspaces.workspace') {
        throw Error(`${workspaceId} is not a workspace (but a ${workspace.typeUri})`)
      }
      state.workspace = workspace
      updateWorkspaceCookie()
      updateIsWritable()
      fetchDiscussion()
      return getWorkspaceTopicmap(workspaceId)
    }).then(topicmap => {
      state.topicmap = topicmap
      state.pan = {
        x: topicmap.panX,
        y: topicmap.panY
      }
      state.zoom = topicmap.zoom
    }).catch(error => {
      console.warn(`Workspace ${workspaceId} check failed`, error)
    })
  },

  setTopic (_, topic) {
    state.topic = topic
  },

  setTopicPos (_, {topic, x, y}) {
    const pos = {x, y}
    topic.setPosition(pos)                                            // update client state
    if (topic.id >= 0) {
      dmx.rpc.setTopicPosition(state.topicmap.id, topic.id, pos)      // update server state
    }
  },

  setTopicSize (_, {topic, width, height}) {
    if (topic.id >= 0) {
      dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
        'dmx.topicmaps.width': width,
        'dmx.topicmaps.height': height
      })
    }
  },

  setPan (_, pan) {
    // FIXME: update topicmap model?
    state.pan = pan
    setTopicmapViewport()     // update server state (debounced)
  },

  setViewport (_, {pan, zoom}) {
    // FIXME: update topicmap model?
    state.pan = pan
    state.zoom = zoom
    setTopicmapViewport()     // update server state (debounced)
  },

  setPanelVisibility (_, visibility) {
    state.panelVisibility = visibility
  },

  setPanelX (_, x) {
    state.panelX = x
  },

  readPanelXFromView () {
    state.panelX = document.querySelector('.left-panel').clientWidth
  },

  dragStart () {
    // console.log('dragStart')
    state.isDragging = true
  },

  dragStop () {
    // console.log('dragStop')
    state.isDragging = false
  },

  setFullscreen ({dispatch}, fullscreen) {
    state.fullscreen = fullscreen
    if (!fullscreen) {
      Vue.nextTick(() => {
        document.querySelector('.zw-resizer').__vue__.resize()
      })
    }
  },

  newTopic (_, topic) {
    state.newTopics.push(topic)
    //
    // workaround to prevent body scrolling when new topic exceeds viewport
    document.body.classList.add('fixed')
    Vue.nextTick(() => {
      // a fixed body would not adapt to window resize anymore
      document.body.classList.remove('fixed')
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createDocument (_, topic) {
    return dmx.rpc.createTopic(topic).then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  updateDocument ({dispatch}, {topic, docModel}) {
    // Transfer edit buffer to topic model ### TODO: refactor
    topic.children['zukunftswerk.document_name.de'] = docModel.names.de
    topic.children['zukunftswerk.document_name.fr'] = docModel.names.fr
    topic.children['dmx.files.file#zukunftswerk.de'] = docModel.paths.de.value ? docModel.files.de : undefined
    topic.children['dmx.files.file#zukunftswerk.fr'] = docModel.paths.fr.value ? docModel.files.fr : undefined
    //
    dispatch('update', topic)
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createNote (_, topic) {
    return http.post('/zukunftswerk/note', topic.value, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    .then(response => response.data)
    .then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createLabel (_, topic) {
    return http.post('/zukunftswerk/label', topic.value, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    .then(response => response.data)
    .then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createArrow (_, topic) {
    return dmx.rpc.createTopic(topic).then(_topic => {
      addTopicToTopicmap(topic, _topic)
    })
  },

  /**
   * @param   refTopicIds    array: a Comment ID, or a Document ID, or both
   */
  createComment (_, {comment, refTopicIds, fileTopicIds}) {
    return http.post('/zukunftswerk/comment', comment, {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {
        refTopicIds: refTopicIds.join(','),
        fileTopicIds: fileTopicIds.join(',')
      }
    }).then(response => {
      const comment = new dmx.Topic(response.data)
      state.discussion.push(comment)
      return comment
    })
  },

  /**
   * @param   comment   a dmx.Topic
   */
  updateComment (_, {commentId, commentModel}) {
    dmx.rpc.updateTopic({
      id: commentId,
      children: {
        'zukunftswerk.comment.de': commentModel.de,
        'zukunftswerk.comment.fr': commentModel.fr
      }
    }).then(replaceComment)
  },

  addComment (_, comment) {
    state.discussion.push(comment)
  },

  jumpToComment (_, {comment, behavior = 'smooth'}) {
    // 1) Scroll comment into view
    // Safari note: Safari ignores scrollIntoView() "behavior" option; scrolling is not smooth.
    // Chrome note: in Chrome after new-comment scrolling does not work at all if "behavior" is set to "smooth".
    // (In contrast for comment-ref-click scrolling DOES work, and is even smooth.) As workaraound we use "auto"
    // in this very case. Scrolling works then (but not smooth, as expected).
    // "scrollIntoView() has a long bug-history in Chrome, some of them are still open for now." (May 2020)
    // https://stackoverflow.com/questions/61885401/scrollintoview-is-not-working-in-chrome-version-81
    const commentSelector = `.zw-discussion .zw-comment[data-id="${comment.id}"]`
    document.querySelector(commentSelector).scrollIntoView({
      behavior,
      block: 'nearest'      // avoid body scroll
    })
    // 2) Apply "glow" effect
    const text = document.querySelector(`${commentSelector} .columns`)
    text.classList.add('glow')
    setTimeout(() => {
      text.classList.remove('glow')
    }, 3000)    // corresponds to CSS variable "--glow-duration" in App.vue
  },

  /**
   * @param   document    a Document topic (plain object)
   */
  revealDocument ({dispatch}, document) {
    // 1) select and pan
    const topic = state.topicmap.getTopic(document.id)
    dispatch('setTopic', topic)
    dispatch('setPan', {
      x: -topic.pos.x * state.zoom + state.NEW_POS_X,
      y: -topic.pos.y * state.zoom + state.NEW_POS_Y
    })
    // 2) set doc filter
    dispatch('setRefDocument', document)
  },

  setRefDocument ({dispatch}, document) {
    state.refDocument = document
    if (document) {
      dispatch('setPanelVisibility', true)
    }
  },

  edit ({dispatch}, topic) {
    dispatch('setTopic', topic)   // select programmatically
    state.isEditActive.push(topic.id)
  },

  delete ({dispatch}, topic) {
    dispatch('setTopic', topic)   // select programmatically
    confirmDeletion().then(() => {
      state.topicmap.removeTopic(topic.id)        // update client state
      dmx.rpc.deleteTopic(topic.id)               // update server state
    }).catch(() => {})  // suppress unhandled rejection on cancel
  },

  deleteComment ({dispatch}, comment) {
    confirmDeletion('warning.delete_comment').then(() => {
      removeComment(comment)                      // update client state
      dmx.rpc.deleteTopic(comment.id)             // update server state
    }).catch(() => {})  // suppress unhandled rejection on cancel
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  update (_, topic) {
    return dmx.rpc.updateTopic(topic).then(directives => {
      removeEditActive(topic)
    })
  },

  cancel (_, topic) {
    if (!topic.id) {
      // abort creation
      removeNewTopic(topic)                       // update client state
    } else {
      // abort update
      removeEditActive(topic)                     // update client state
    }
  },

  downloadFile (_, repoPath) {
    state.downloadUrl = filerepoUrl(repoPath) + '?download'
    setTimeout(() => {
      state.downloadUrl = undefined     // reset required for downloading the same file twice
    }, 1000)
  },

  getFileContent (_, repoPath) {
    return http.get(filerepoUrl(repoPath))
      .then(response => response.data)
  }
}

// Quill instances inside comments-list need special options
state.quillOptions2 = {bounds: '.zw-discussion .comments', ...state.quillOptions}

const store = new Vuex.Store({
  state,
  actions
})

store.registerModule('admin', adminStore)

export default store

// state helper

/**
 * Initialzes 3 states:
 *   "username"
 *   "workspaces"
 *   "isTeam"
 *
 * @param   username  the username or empty/undefined if not logged in
 *
 * @return  a promise, resolved once the state is initialized.
 */
function initUserState (username) {
  console.log(username)
  if (username) {
    return Promise.all([
      teamWorkspace
        .then(workspace => workspace.isWritable())
        .then(isWritable => {
          state.username = username
          state.isTeam = isWritable
        }),
      http.get('/zukunftswerk/workspaces').then(response => {
        state.workspaces = response.data
      }),
      store.dispatch('fetchAllUsers')     // needed for accessing display names
    ])
  } else {
    state.username = ''
    state.workspaces = []
    state.isTeam = false
    return Promise.resolve()
  }
}

function updateWorkspaceCookie () {
  if (state.workspace) {
    dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
  }
}

function updateIsWritable () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
}

function fetchDiscussion () {
  http.get('/zukunftswerk/discussion').then(response => {
    state.discussion = dmx.utils.instantiateMany(response.data, dmx.Topic).sort(
      (c1, c2) => c1.children['dmx.timestamps.created'].value - c2.children['dmx.timestamps.created'].value
    )
  })
}

/**
 * Transfers "id", "value", and "children" from the given topic to the given viewTopic and adds the viewTopic
 * to the topicmap. Updates both, client state and server state.
 */
function addTopicToTopicmap (viewTopic, topic) {
  viewTopic.id       = topic.id
  viewTopic.value    = topic.value
  viewTopic.children = topic.children
  state.topicmap.addTopic(viewTopic)                                                // update client state
  dmx.rpc.addTopicToTopicmap(state.topicmap.id, topic.id, viewTopic.viewProps)      // update server state
}

// TODO: unify this 3 functions

function removeNewTopic (topic) {
  const i = state.newTopics.indexOf(topic)
  if (i === -1) {
    throw Error('removeNewTopic')
  }
  state.newTopics.splice(i, 1)
}

function removeEditActive (topic) {
  const i = state.isEditActive.indexOf(topic.id)
  if (i === -1) {
    throw Error('removeEditActive')
  }
  state.isEditActive.splice(i, 1)
}

function removeComment (comment) {
  const i = state.discussion.indexOf(comment)
  if (i === -1) {
    throw Error('removeComment')
  }
  state.discussion.splice(i, 1)
}

function replaceComment (comment) {
  const i = state.discussion.findIndex(cmt => cmt.id === comment.id)
  if (i === -1) {
    throw Error('replaceComment')
  }
  state.discussion.splice(i, 1, comment)
}

function setTopicmapViewport() {
  if (state.isTeam) {
    dmx.rpc.setTopicmapViewport(state.topicmap.id, state.pan, state.zoom)           // update server state
  }
}

function getUser (username) {
  return state.users.find(ws => ws.value === username)
}

function getString (key) {
  return state.uiStrings[`${key}.${state.lang}`]
}

// util

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}

function confirmDeletion (textKey = 'warning.delete') {
  return MessageBox.confirm(getString(textKey), 'Warning', {
    type: 'warning',
    confirmButtonText: getString('action.delete'),
    confirmButtonClass: 'el-button--danger',
    showClose: false
  })
}

function getWorkspaceTopicmap (workspaceId) {
  return dmx.rpc.getAssignedTopics(workspaceId, 'dmx.topicmaps.topicmap').then(topics => {
    // TODO: show warning if there are more than one topicmaps
    return dmx.rpc.getTopicmap(topics[0].id, true)      // includeChildren=true
  })
}
