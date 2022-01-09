<template>
  <vue-drag-resize :isActive="isActive" :x="topic.pos.x" :y="topic.pos.y" :w="w" h="auto" :sticks="['mr', 'ml']"
      @clicked="select" @dragstop="setPos" @resizestop="setSize">
    <component :is="topic.typeUri" :topic="topic" :mode="mode" ref="detail" @mousedown.native="mousedown"></component>
  </vue-drag-resize>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mounted () {
    // once mounted we set actual width; 'auto' would prohibit manual resize
    if (this.w === 'auto') {
      this.w = this.$el.clientWidth
    }
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
    const width = this.topic.viewProps['dmx.topicmaps.width']
    return {
      w: width || 'auto'      // if width is unknown let the child component's style determine the initial width
    }
  },

  computed: {

    topicmap () {
      return this.$store.state.topicmap
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    selectedTopic () {
      return this.$store.state.topic
    },

    isActive () {
      return this.selectedTopic && this.selectedTopic.id === this.topic.id
    }
  },

  methods: {

    select (e) {
      this.$store.dispatch('setTopic', this.topic)
    },

    mousedown (e) {
      // console.log('mousedown', e.target.tagName)
      const inInput = e.target.tagName === 'INPUT'
      const inQuill = e.target.closest('.ql-container')
      if (inInput || inQuill) {
        e.stopPropagation()     // prevents vue-drag-resize from starting a drag
      }
    },

    setPos (e) {
      const pos = {x: e.left, y: e.top}
      this.topic.setPosition(pos)                                           // update client state
      if (this.topic.id >= 0 && this.isWritable) {
        dmx.rpc.setTopicPosition(this.topicmap.id, this.topic.id, pos)      // update server state
      }
    },

    setSize (e) {
      if (this.topic.id >= 0 && this.isWritable) {
        console.log(e.width, e.height)
        if (!isNaN(e.width)) {
          dmx.rpc.setTopicViewProps(this.topicmap.id, this.topic.id, {
            'dmx.topicmaps.width': e.width,
            'dmx.topicmaps.height': e.height
          })
        }
      }
    }
  },

  components: {
    'zukunftswerk.document': require('./zw-document').default,
    'zukunftswerk.note': require('./zw-note').default,
    'zukunftswerk.label': require('./zw-label').default,
    'vue-drag-resize': require('vue-drag-resize').default
  }
}
</script>
