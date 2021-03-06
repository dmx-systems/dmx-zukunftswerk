import store from './store/zukunftswerk'
import zw from './zw-globals'
import dmx from 'dmx-api'
import Vue from 'vue'

export default message => {
  const topicmap = store.state.topicmap
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
    if (message.args.topicmapId === topicmap.id) {
      const topic = message.args.viewTopic
      if (zw.canvasFilter(topic)) {
        topicmap.addTopic(new dmx.ViewTopic(topic))
      }
    }
    break
  case 'setTopicPosition':
    if (message.args.topicmapId === topicmap.id) {
      const topic = topicmap.getTopic(message.args.topicId)
      topic.setPosition(message.args.pos)
      if (zw.canvasFilter(topic)) {
        store.dispatch('updateControlBox', {topicId: topic.id})
      }
    }
    break
  case 'processDirectives':
    message.args.forEach(directive => {
      let topic
      switch (directive.type) {
      case 'UPDATE_TOPIC':
        topic = directive.arg
        if (topic.typeUri === 'zukunftswerk.comment') {
          store.dispatch('replaceComment', topic)
        } else {
          const _topic = topicmap.getTopicIfExists(topic.id)
          if (_topic) {
            topic.viewProps = _topic.viewProps
            topicmap.addTopic(new dmx.ViewTopic(topic))
            // TODO: better model support for replace-topic
          }
        }
        break
      case 'DELETE_TOPIC':
        topic = directive.arg
        if (topic.typeUri === 'zukunftswerk.comment') {
          store.dispatch('removeComment', topic)
        } else {
          topicmap.removeTopic(topic.id)
        }
        break
      }
    })
    break
  }
}
