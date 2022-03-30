import Vue from 'vue'
import {
  Button, Input, Checkbox, Select, Option, Dropdown, DropdownMenu, DropdownItem, Dialog, Upload,
  Collapse, CollapseItem, Loading, MessageBox, Notification
} from 'element-ui'
import locale from 'element-ui/lib/locale'
import DialogDraggable from 'vue-element-dialog-draggable'

// set locale
locale.use(require('element-ui/lib/locale/lang/en').default)

// register components
Vue.use(Button)
Vue.use(Input)
Vue.use(Checkbox)
Vue.use(Select)
Vue.use(Option)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Dialog)
Vue.use(DialogDraggable)
Vue.use(Upload)
Vue.use(Collapse)
Vue.use(CollapseItem)

Vue.use(Loading.directive)

Vue.prototype.$msgbox  = MessageBox
Vue.prototype.$alert   = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt  = MessageBox.prompt

Vue.prototype.$notify = Notification
