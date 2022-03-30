import dmx from 'dmx-api'
import DMXWebSocket from 'dmx-websocket'
import Vue from 'vue'
import App from './components/App'
import store from './store/zukunftswerk'
import router from './router'
import onHttpError from './error-handler'
import messageHandler from './message-handler'
import './element-ui'

console.log('[ZW] 2022/03/30')

// 1) Init dmx library ### TODO: only top-level types should be required here
dmx.init({store, onHttpError})
dmx.typeCache.initTopicType('zukunftswerk.document')
dmx.typeCache.initTopicType('zukunftswerk.document_name.de')
dmx.typeCache.initTopicType('zukunftswerk.document_name.fr')
dmx.typeCache.initTopicType('zukunftswerk.note')
dmx.typeCache.initTopicType('zukunftswerk.note.de')
dmx.typeCache.initTopicType('zukunftswerk.note.fr')
dmx.typeCache.initTopicType('zukunftswerk.label')
dmx.typeCache.initTopicType('zukunftswerk.label.de')
dmx.typeCache.initTopicType('zukunftswerk.label.fr')
dmx.typeCache.initTopicType('zukunftswerk.language')
dmx.typeCache.initAssocType('zukunftswerk.original_language')
dmx.typeCache.initAssocType('zukunftswerk.de')
dmx.typeCache.initAssocType('zukunftswerk.fr')
dmx.typeCache.initTopicType('dmx.files.file')
dmx.typeCache.initTopicType('dmx.files.file_name')
dmx.typeCache.initTopicType('dmx.files.path')
dmx.typeCache.initTopicType('dmx.files.media_type')
dmx.typeCache.initTopicType('dmx.files.size')
dmx.typeCache.initAssocType('dmx.core.composition')

// 2) Open websocket connection
new DMXWebSocket('systems.dmx.webclient', messageHandler)

// 3) Global component registrations (used in several components)
Vue.component('zw-language-switch', require('./components/zw-language-switch').default)
Vue.component('zw-string',          require('./components/zw-string').default)
Vue.component('zw-truncate',        require('./components/zw-truncate').default)
Vue.component('zw-comment-ref',     require('./components/zw-comment-ref').default)
Vue.component('zw-document-ref',    require('./components/zw-document-ref').default)
Vue.component('zw-attachment',      require('./components/zw-attachment').default)
Vue.component('zw-pdf-viewer',      require('./components/zw-pdf-viewer').default)

// 4) Create Vue root instance
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
