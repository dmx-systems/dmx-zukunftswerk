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

  removeTopic (_, topic) {
    const i = state.newTopics.indexOf(topic)
    if (i === -1) {
      throw Error()
    }
    state.newTopics.splice(i, 1)
  },

  setLang (_, lang) {
    state.lang = lang
  }
}

const getters = {
}

const store = new Vuex.Store({
  state,
  actions,
  getters
})

export default store
