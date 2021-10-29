<template>
  <vue-drag-resize :x="topic.pos.x" :y="topic.pos.y" :w="w" h="auto" :sticks="['mr', 'ml']">
    <component :is="topic.typeUri" :topic="topic" ref="detail"></component>
  </vue-drag-resize>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mounted () {
    this.w = this.$el.clientWidth
    this.$refs.detail.$el.style['min-width'] = 'unset'
    this.$refs.detail.$el.style['max-width'] = 'unset'
  },

  props: {
    topic: dmx.ViewTopic,     // the topic to render (dmx.ViewTopic)
    mode: {                   // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  data () {
    return {
      w: 'auto'
    }
  },

  components: {
    'dmx.notes.note': require('./zw-note').default,
    'vue-drag-resize': require('vue-drag-resize').default
  }
}
</script>
