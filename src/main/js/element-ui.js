import Vue from 'vue'
import {Button, Dropdown, DropdownMenu, DropdownItem, Loading} from 'element-ui'
import locale from 'element-ui/lib/locale'

// set locale
locale.use(require('element-ui/lib/locale/lang/en').default)

// register components
Vue.use(Button)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)

Vue.use(Loading.directive)
