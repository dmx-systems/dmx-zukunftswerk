import store from './store/zukunftswerk'
import zw from './zw-globals'
import dmx from 'dmx-api'
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
    break
  case 'addTopicToTopicmap':
    if (message.args.topicmapId === store.state.topicmap.id) {
      const topic = message.args.viewTopic
      if (zw.canvasFilter(topic)) {
        store.dispatch('addTopicToTopicmap', new dmx.ViewTopic(topic))
      }
    }
    break
  case 'setTopicPosition':
    const topicmap = store.state.topicmap
    if (message.args.topicmapId === topicmap.id) {
      topicmap.getTopic(message.args.topicId).setPosition(message.args.pos)
    }
  }
}
