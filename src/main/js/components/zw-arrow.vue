<template>
  <!-- Note: class "zw-arrow" is located at parent -->
  <svg class="svg" xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
        <polygon points="0 0, 6 2.5, 0 5" fill="#909399" />
      </marker>
    </defs>
    <line :x1="0" :y1="0" :x2="size.w" :y2="0" stroke="#909399" stroke-width="6"
      marker-end="url(#arrowhead)" />
  </svg>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mixins: [
    require('./mixins/selection').default,
    require('./mixins/dragging').default
  ],

  created () {
    // console.log('zw-arrow', this.topic.pos, this.pos, this.size)
    this.$emit('custom-class', 'zw-arrow')
    this.$emit('edit-enabled', false)
    this.$emit('rotate-enabled', false)
    this.$emit('resize-style', 'none')
    this.$emit('get-size', () => this.size)
    this.$emit('move-handler', this.onMove)
  },

  props: {
    topic: {                    // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  computed: {

    viewBox () {
      return `0 -16 ${this.size.w} ${this.size.h}`
    },

    size () {
      return {
        w: this.topic.viewProps['dmx.topicmaps.width'],
        h: 30
      }
    }
  },

  methods: {
    onMove () {
      document.querySelector('.zw-arrow-handles').__vue__.updateHandles()
    }
  }
}
</script>

<style>
.zw-arrow .svg {
  overflow: visible;
}
</style>
