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
  panelVisibility: false,       // discussion panel visibility (Boolean)
  discussion: undefined,        // the discussion displayed in the discussion panel (array of dmx.RelatedTopic)
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
    })
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

  createComment (_, comment) {
    return http.post(`/zukunftswerk/comment/${state.workspace.id}`, comment, {
      headers: {
        'Content-Type': 'text/plain'
      }
    }).then(response => {
      state.discussion.push(response.data)
    })
  },

  setPanelVisibility (_, visibility) {
    state.panelVisibility = visibility
    if (visibility && !state.discussion) {
      http.get(`/zukunftswerk/discussion/${state.workspace.id}`).then(response => {
        state.discussion = response.data
      })
    }
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

function removeTopic (topic) {
  const i = state.newTopics.indexOf(topic)
  if (i === -1) {
    throw Error('removeTopic')
  }
  state.newTopics.splice(i, 1)
}
