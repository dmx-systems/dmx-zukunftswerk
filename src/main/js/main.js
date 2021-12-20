import Vue from 'vue'
import dmx from 'dmx-api'
import App from './components/App'
import store from './store'
import router from './router'
import './element-ui'

// 1) Init dmx library
dmx.init({store})

// 2) Global component registrations
Vue.component('zw-string',       require('./components/zw-string').default)
Vue.component('zw-truncate',     require('./components/zw-truncate').default)
Vue.component('zw-comment-ref',  require('./components/zw-comment-ref').default)
Vue.component('zw-document-ref', require('./components/zw-document-ref').default)
Vue.component('zw-attachment',   require('./components/zw-attachment').default)

// 3) Create Vue root instance
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})

// 4) Initial navigation
store.dispatch('initialNavigation')
