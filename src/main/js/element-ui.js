import Vue from 'vue'
import {Button, Input, Dropdown, DropdownMenu, DropdownItem, Dialog, Upload, Loading} from 'element-ui'
import locale from 'element-ui/lib/locale'

// set locale
locale.use(require('element-ui/lib/locale/lang/en').default)

// register components
Vue.use(Button)
Vue.use(Input)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Dialog)
Vue.use(Upload)

Vue.use(Loading.directive)
