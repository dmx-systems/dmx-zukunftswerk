import Vue from 'vue'
import App from './components/App'
import dmx from 'dmx-api'
import store from './store'
import router from './router'
import './element-ui'

// 1) Init dmx library
// The dmx library must be inited *before* the dmx-webclient component is instantiated.
// The dmx-webclient component relies on the "typeCache" store module as registered by dmx.init(). ### TODO: still true?
const dmxReady = dmx.init({store})

// 2) Global component registrations
Vue.component('zw-string', require('./components/zw-string').default)

// 3) Create Vue root instance
// Instantiates router-view and dmx-webclient components.
const root = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})

// 4) Initial navigation
// Initial navigation must take place *after* the webclient plugins are loaded.
// The "workspaces" store module is registered by the Workspaces plugin.
Promise.all([
  // Both, the Topicmap Panel and the Detail Panel, rely on a populated type cache.
  // The type cache must be ready *before* "initialNavigation" is dispatched.
  dmxReady
]).then(() => {
  store.dispatch('initialNavigation')
})
