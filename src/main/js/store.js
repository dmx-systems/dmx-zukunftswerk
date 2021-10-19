import Vue from 'vue'
import Vuex from 'vuex'
import dmx from 'dmx-api'

Vue.use(Vuex)

const state = {
  workspace: undefined,       // the workspace (topic) the current topicmap belongs to
  topicmap: undefined,        // the topicmap displayed on workspace canvas
  lang: 'de',                 // UI language ('de'/'fr')
  langStrings: require('./lang-strings').default
}

const actions = {
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
