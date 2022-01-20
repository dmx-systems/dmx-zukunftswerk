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
    <vue-drag-resize :isActive="true" :isResizable="false" :x="topic.pos.x" :y="topic.pos.y" w="auto" h="auto">
      <div class="vdr-stick" :style="stickStyle">
      </div>
    </vue-drag-resize>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    topic: {                  // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  computed: {

    zoom () {
      return this.$store.state.zoom
    },

    stickStyle () {
      return {
        width:  `${8 / this.zoom}px`,
        height: `${8 / this.zoom}px`
      }
    }
  },

  components: {
    'vue-drag-resize': require('vue-drag-resize').default
  }
}
</script>

<style>
.zw-arrow {
  max-width: 200px;
}

.zw-arrow .vdr-stick {
}
</style>
