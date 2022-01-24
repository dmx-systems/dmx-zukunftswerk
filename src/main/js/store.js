import Vue from 'vue'
import Vuex from 'vuex'
import {MessageBox} from 'element-ui'
import http from 'axios'
import dmx from 'dmx-api'

window.addEventListener('focus', updateWorkspaceCookie)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team')
const width = window.innerWidth

const state = {

  username: undefined,          // username of logged in user (String), undefined if not logged in
  isTeam: false,                // true if the logged in user is member of the "Team" workspace (Boolean)

  topicmap: undefined,          // the topicmap displayed on canvas (dmx.Topicmap)
  workspace: undefined,         // the workspace the topicmap belongs to (dmx.Topic)
  isWritable: false,            // true if the workspace is writable (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  isEditActive: [],             // IDs of topics being edited (array)
  pan: {x: 0, y: 0},            // canvas pan (in pixel)
  zoom: 1,                      // canvas zoom (Number)

  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * width,         // x coordinate in pixel (Number)
  discussion: undefined,        // the comments displayed in discussion panel (array of dmx.RelatedTopic)
  refDocument: undefined,       // document the new comment relates to (a Document topic, plain object)
  downloadUrl: undefined,       // URL of previously downloaded comment attachment

  lang: 'de',                   // UI language ('de'/'fr')
  langStrings:  require('./lang-strings').default,
  quillOptions: require('./quill-options').default
}

const actions = {

  loggedIn (_, username) {
    DEV && console.log('Login', username)
    setUsername(username)
    updateIsWritable()
  },

  logout () {
    DEV && console.log('Logout', state.username)
    dmx.rpc.logout().then(() => {
      state.username = undefined
      state.isTeam = false
      updateIsWritable()
    })
  },

  setTopicmap (_, topicmap) {
    state.topicmap = topicmap
    state.pan = {
      x: topicmap.panX,
      y: topicmap.panY
    }
    state.zoom = topicmap.zoom
  },

  setWorkspace (_, workspace) {
    state.workspace = workspace
    updateWorkspaceCookie()
    updateIsWritable()
    fetchDiscussion()
  },

  setTopic (_, topic) {
    state.topic = topic
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
      removeTopic(topic)
    })
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
      removeTopic(topic)
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
      removeTopic(topic)
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
   * @param   refTopicId    optional: a Comment ID or a Document ID
   */
  createComment (_, {comment, refTopicId, fileTopicIds}) {
    return http.post('/zukunftswerk/comment', comment, {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {
        refTopicId,
        fileTopicIds: fileTopicIds.join(',')
      }
    }).then(response => {
      const comment = response.data
      state.discussion.push(comment)
      state.refDocument = undefined
      return comment
    })
  },

  newComment (_, comment) {
    state.discussion.push(comment)
  },

  /**
   * @param   document    a Document topic (plain object)
   */
  revealDocument ({dispatch}, document) {
    const topic = state.topicmap.getTopic(document.id)
    dispatch('setTopic', topic)
    dispatch('setPan', {
      x: -topic.pos.x * state.zoom + 40,    // 40 matches zw-canvas.vue viewProps()
      y: -topic.pos.y * state.zoom
    })
  },

  setRefDocument ({dispatch}, document) {
    state.refDocument = document
    if (document) {
      dispatch('setPanelVisibility', true)
    }
  },

  setPan (_, pan) {
    state.pan = pan
    setTopicmapViewport()     // update server state (debounced)
  },

  setZoom (_, zoom) {
    state.zoom = zoom
    setTopicmapViewport()     // update server state (debounced)
  },

  setPanelVisibility (_, visibility) {
    state.panelVisibility = visibility
  },

  setPanelX (_, x) {
    state.panelX = x
  },

  setLang (_, lang) {
    state.lang = lang
  },

  edit () {
    state.isEditActive.push(state.topic.id)
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  update (_, topic) {
    return dmx.rpc.updateTopic(topic).then(directives => {
      removeEditActive(topic)
    })
  },

  delete () {
    confirmDeletion().then(() => {
      state.topicmap.removeTopic(state.topic.id)    // update client state
      dmx.rpc.deleteTopic(state.topic.id)           // update server state
    }).catch(() => {})      // suppress unhandled rejection on cancel
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

const store = new Vuex.Store({
  state,
  actions
})

export default store

// init state

dmx.rpc.getUsername().then(setUsername)

// state helper

function setUsername (username) {
  teamWorkspace
    .then(workspace => workspace.isWritable())
    .then(isWritable => {
      state.username = username
      state.isTeam = isWritable
    })
}

function updateWorkspaceCookie () {
  // console.log('dmx_workspace_id', state.workspace.id)
  dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
}

function updateIsWritable () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
}

function fetchDiscussion () {
  http.get('/zukunftswerk/discussion').then(response => {
    state.discussion = response.data.sort(
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

function removeTopic (topic) {
  const i = state.newTopics.indexOf(topic)
  if (i === -1) {
    throw Error('removeTopic')
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

function setTopicmapViewport() {
  if (state.isTeam) {
    dmx.rpc.setTopicmapViewport(state.topicmap.id, state.pan, state.zoom)
  }
}

function getString (key) {
  return state.langStrings[`${key}.${state.lang}`]
}

// util

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}

function confirmDeletion () {
  return MessageBox.confirm(getString('warning.deletion'), 'Warning', {
    type: 'warning',
    confirmButtonText: getString('button.delete'),
    confirmButtonClass: 'el-button--danger',
    showClose: false
  })
}
