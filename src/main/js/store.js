import Vue from 'vue'
import Vuex from 'vuex'
import dmx from 'dmx-api'

Vue.use(Vuex)

const state = {
  workspace: undefined,       // the workspace the current topicmap belongs to (dmx.Topic)
  topicmap: undefined,        // the topicmap displayed on workspace canvas (dmx.Topicmap)
  newTopics: [],              // topics being created, not yet saved (array of dmx.ViewTopic)
  lang: 'de',                 // UI language ('de'/'fr')
  langStrings: require('./lang-strings').default
}

const actions = {

  newTopic (_, topic) {
    state.newTopics.push(topic)
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createTopic (_, topic) {
    dmx.rpc.createTopic(topic).then(_topic => {
      dmx.rpc.addTopicToTopicmap(state.topicmap.id, _topic.id, topic.viewProps)
      store.dispatch('_processDirectives', _topic.directives)
      const viewTopic = _topic.newViewTopic(topic.viewProps)
      viewTopic.children = _topic.children      // ### TODO, see comment in newViewTopic()
      state.topicmap.addTopic(viewTopic)
    })
    removeTopic(topic)
  },

  setLang (_, lang) {
    state.lang = lang
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
