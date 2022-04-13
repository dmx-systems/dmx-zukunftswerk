<template>
  <div class="zw-arrow">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#909399" />
        </marker>
      </defs>
      <line x1="0" y1="50" x2="250" y2="50" stroke="#909399" stroke-width="8" marker-end="url(#arrowhead)" />
    </svg>
    <div class="handle from"></div>
    <div class="handle to"></div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    console.log('zw-arrow', this.pos)
    this.$emit('resize-style', 'none')
  },

  props: {
    topic: {                  // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  computed: {
    pos () {
      return {
        x1: this.topic.viewProps['zukunftswerk.x1'],
        y1: this.topic.viewProps['zukunftswerk.y1'],
        x2: this.topic.viewProps['zukunftswerk.x2'],
        y2: this.topic.viewProps['zukunftswerk.y2']
      }
    }
  }
}
</script>

<style>
.zw-arrow .handle {
}
</style>
