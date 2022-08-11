import dmx from 'dmx-api'
import DMXWebSocket from 'dmx-websocket'
import Vue from 'vue'
import App from './components/App'
import store from './store/zukunftswerk'
import router from './router'
import onHttpError from './error-handler'
import messageHandler from './message-handler'
import './element-ui'

console.log('[ZW] 2022/08/11-7')

// 1) Init dmx library
dmx.init({
  topicTypes: [                   // types are needed for dmx-api form generator (type.newFormModel())
    'zukunftswerk.document',
    'zukunftswerk.note',
    'zukunftswerk.label',
    'dmx.workspaces.workspace'    // needed by admin interface
  ],
  store,
  onHttpError
})

// 2) Open websocket connection
new DMXWebSocket('systems.dmx.webclient', messageHandler)

// 3) Global component registrations (needed by several components)
Vue.component('zw-language-switch',      require('./components/zw-language-switch').default)
Vue.component('zw-string',               require('./components/zw-string').default)
Vue.component('zw-truncate',             require('./components/zw-truncate').default)
Vue.component('zw-comment-ref',          require('./components/zw-comment-ref').default)
Vue.component('zw-document-ref',         require('./components/zw-document-ref').default)
Vue.component('zw-attachment',           require('./components/zw-attachment').default)
Vue.component('zw-pdf-viewer',           require('./components/zw-pdf-viewer').default)

// 4) Create Vue root instance
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
