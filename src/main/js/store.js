import Vue from 'vue'
import Vuex from 'vuex'
import http from 'axios'
import dmx from 'dmx-api'

window.addEventListener('focus', updateWorkspaceCookie)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team')
const width = window.innerWidth

const state = {

  username: undefined,          // username of logged in user (String), undefined if not logged in
  isTeam: false,                // true if the logged in user is member of the "Team" workspace (Boolean)

  topicmap: undefined,          // the topicmap displayed on workspace canvas (dmx.Topicmap)
  workspace: undefined,         // the workspace the topicmap belongs to (dmx.Topic)
  isWritable: false,            // true if the workspace is writable (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
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
      dmx.rpc.addTopicToTopicmap(state.topicmap.id, _topic.id, topic.viewProps)
      topic.id       = _topic.id
      topic.value    = _topic.value
      topic.children = _topic.children
      state.topicmap.addTopic(topic)
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
      dmx.rpc.addTopicToTopicmap(state.topicmap.id, _topic.id, topic.viewProps)
      topic.id       = _topic.id
      topic.value    = _topic.value
      topic.children = _topic.children
      state.topicmap.addTopic(topic)
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
      dmx.rpc.addTopicToTopicmap(state.topicmap.id, _topic.id, topic.viewProps)
      topic.id       = _topic.id
      topic.value    = _topic.value
      topic.children = _topic.children
      state.topicmap.addTopic(topic)
      removeTopic(topic)
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
    state.pan.x = -topic.pos.x    // TODO: geometry, zoom?
    state.pan.y = -topic.pos.y    // TODO: geometry, zoom?
    dispatch('setTopic', topic)
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

function removeTopic (topic) {
  const i = state.newTopics.indexOf(topic)
  if (i === -1) {
    throw Error('removeTopic')
  }
  state.newTopics.splice(i, 1)
}

function setTopicmapViewport() {
  if (state.isTeam) {
    dmx.rpc.setTopicmapViewport(state.topicmap.id, state.pan, state.zoom)
  }
}

// util

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}
