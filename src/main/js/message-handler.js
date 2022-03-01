import store from './store'
import Vue from 'vue'

export default message => {
  switch (message.type) {
  case 'addComment':
    if (message.args.workspaceId === store.state.workspace.id) {
      const comment = message.args.comment
      store.dispatch('addComment', comment)
      Vue.nextTick(() => {
        store.dispatch('jumpToComment', {comment})
      })
    }
  }
}
