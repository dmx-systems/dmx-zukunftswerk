<template>
  <vue-drag-resize :x="topic.pos.x" :y="topic.pos.y" :w="w" h="auto" :sticks="['mr', 'ml']" @dragstop="setPos">
    <component :is="topic.typeUri" :topic="topic" :mode="mode" ref="detail"></component>
  </vue-drag-resize>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mounted () {
    // once mounted we set actual width; 'auto' would prohibit manual resize
    this.w = this.$el.clientWidth
    this.$refs.detail.$el.style['min-width'] = 'unset'
    this.$refs.detail.$el.style['max-width'] = 'unset'
  },

  props: {
    topic: {
      type: dmx.ViewTopic,    // the topic to render (dmx.ViewTopic)
      required: true
    },
    mode: {                   // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  data () {
    return {
      w: 'auto'     // let the child component's style determine the initial width
    }
  },

  computed: {

    topicmap () {
      return this.$store.state.topicmap
    },

    isWritable () {
      return this.$store.state.isWritable
    }
  },

  methods: {
    setPos (e) {
      const pos = {x: e.left, y: e.top}
      this.topic.setPosition(pos)                                           // update client state
      if (this.topic.id >= 0 && this.isWritable) {
        dmx.rpc.setTopicPosition(this.topicmap.id, this.topic.id, pos)      // update server state
      }
    }
  },

  components: {
    'dmx.notes.note': require('./zw-note').default,
    'vue-drag-resize': require('vue-drag-resize').default
  }
}
</script>
