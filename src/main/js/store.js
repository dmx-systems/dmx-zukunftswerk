import Vue from 'vue'
import Vuex from 'vuex'
import http from 'axios'
import dmx from 'dmx-api'

Vue.use(Vuex)

const state = {

  topicmap: undefined,          // the topicmap displayed on workspace canvas (dmx.Topicmap)
  workspace: undefined,         // the workspace the topicmap belongs to (dmx.Topic)
  isWritable: undefined,        // true if the workspace is writable (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  pan: {x: 0, y: 0},            // canvas pan (in pixel)
  zoom: 1,                      // canvas zoom (Number)

  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * window.innerWidth,    // x coordinate in pixel (Number)
  discussion: undefined,        // the comments displayed in the discussion panel (array of dmx.RelatedTopic)
  refDocument: undefined,       // document the new comment relates to (a Document topic, plain object)

  lang: 'de',                   // UI language ('de'/'fr')
  langStrings:  require('./lang-strings').default,
  quillOptions: require('./quill-options').default
}

const actions = {

  setTopicmap (_, topicmap) {
    state.topicmap = topicmap
  },

  setWorkspace (_, workspace) {
    workspace.isWritable().then(isWritable => {
      state.workspace = workspace
      state.isWritable = isWritable
    }).then(fetchDiscussion)
  },

  setTopic (_, topic) {
    state.topic = topic
  },

  newTopic (_, topic) {
    state.newTopics.push(topic)
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
  createComment (_, {comment, refTopicId}) {
    return http.post(`/zukunftswerk/comment/${state.workspace.id}`, comment, {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {
        refTopicId: refTopicId
      }
    }).then(response => {
      state.discussion.push(response.data)
      state.refDocument = undefined
    })
  },

  /**
   * @param   document    a Document topic (plain object)
   */
  revealDocument ({dispatch}, document) {
    const topic = state.topicmap.getTopic(document.id)
    state.pan.x = - topic.pos.x   // TODO: geometry
    state.pan.y = - topic.pos.y   // TODO: geometry
    dispatch('setTopic', topic)
  },

  setZoom (_, zoom) {
    state.zoom = zoom
  },

  setRefDocument ({dispatch}, document) {
    state.refDocument = document
    dispatch('setPanelVisibility', true)
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

  getFileContent (_, repoPath) {
    return http.get('/filerepo/' + encodeURIComponent(repoPath))
      .then(response => response.data)
  }
}

const store = new Vuex.Store({
  state,
  actions
})

export default store

// state helper

function fetchDiscussion () {
  http.get(`/zukunftswerk/discussion/${state.workspace.id}`).then(response => {
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
