import Vue from 'vue'
import Vuex from 'vuex'
import dmx from 'dmx-api'

Vue.use(Vuex)

const state = {
  lang: 'de',
  langStrings: require('./lang-strings').default
}

const actions = {
}

const getters = {
}

const store = new Vuex.Store({
  state,
  actions,
  getters
})

export default store
