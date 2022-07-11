import store from './store/zukunftswerk'
import zw from './zw-globals'
import dmx from 'dmx-api'
import Vue from 'vue'

export default message => {
  const topicmap = store.state.topicmap
  switch (message.type) {
  // Discussion panel
  case 'addComment':
    if (message.args.workspaceId === store.state.workspace.id) {
      const comment = message.args.comment
      store.dispatch('addComment', comment)
      Vue.nextTick(() => {
        store.dispatch('jumpToComment', {comment})
      })
    }
    break
  // Canvas
  case 'addTopicToTopicmap':
    if (message.args.topicmapId === topicmap.id) {
      const topic = message.args.viewTopic
      if (zw.canvasFilter(topic)) {
        topicmap.addTopic(new dmx.ViewTopic(topic))
      }
    }
    break
  case 'setTopicPosition':
    if (message.args.topicmapId === topicmap.id) {
      const topicId = message.args.topicId
      topicmap.getTopic(topicId).setPosition(message.args.pos)
      store.dispatch('updateControlBox', {topicId})
    }
    break
  case 'processDirectives':
    message.args.forEach(directive => {
      switch (directive.type) {
      case 'UPDATE_TOPIC':
        const topic = directive.arg
        topic.viewProps = topicmap.getTopic(topic.id).viewProps
        topicmap.addTopic(new dmx.ViewTopic(topic))
        break
      case 'DELETE_TOPIC':
        topicmap.removeTopic(directive.arg.id)
        break
      }
    })
    break
  }
}
