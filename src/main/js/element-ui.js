import Vue from 'vue'
import {Button} from 'element-ui'
import locale from 'element-ui/lib/locale'

// set locale
locale.use(require('element-ui/lib/locale/lang/en').default)

// global config
Vue.prototype.$ELEMENT = {
  size: 'mini'
}

// register components
Vue.use(Button)
