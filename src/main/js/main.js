import dmx from 'dmx-api'
import DMXWebSocket from 'dmx-websocket'
import Vue from 'vue'
import App from './components/App'
import store from './store'
import router from './router'
import onHttpError from './error-handler'
import messageHandler from './message-handler'
import './element-ui'

// 1) Init dmx library
dmx.init({store, onHttpError})

// 2) Open websocket connection
new DMXWebSocket('systems.dmx.webclient', messageHandler)
// store.dispatch('_' + message.type, message.args)

// 3) Global component registrations
Vue.component('zw-string',       require('./components/zw-string').default)
Vue.component('zw-truncate',     require('./components/zw-truncate').default)
Vue.component('zw-comment-ref',  require('./components/zw-comment-ref').default)
Vue.component('zw-document-ref', require('./components/zw-document-ref').default)
Vue.component('zw-attachment',   require('./components/zw-attachment').default)

// 4) Create Vue root instance
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})

// 5) Initial navigation
store.dispatch('initialNavigation')
