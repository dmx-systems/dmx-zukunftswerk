<template>
  <div class="zw-arrow">
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" class="svg">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#909399" />
        </marker>
      </defs>
      <line :x1="pos.x1" :y1="pos.y1" :x2="pos.x2" :y2="pos.y2" stroke="#909399" stroke-width="8"
        marker-end="url(#arrowhead)" />
    </svg>
    <div class="handles" v-if="selected">
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x1" :y="pos.y1" :w="10" :h="10" :scale="zoom"
        @mousedown.native.stop>
      </vue-draggable-resizable>
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x2" :y="pos.y2" :w="10" :h="10" :scale="zoom"
        @mousedown.native.stop>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  created () {
    console.log('zw-arrow', this.topic.pos, this.pos)
    this.$emit('resize-style', 'none')
  },

  props: {
    topic: {                  // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  computed: {

    selected () {
      return this.selectedTopic?.id === this.topic.id
    },

    viewBox () {
      console.log(`0 0 ${this.size.w} ${this.size.h}`)
      return `0 0 ${this.size.w} ${this.size.h}`
    },

    size () {
      return {
        w: Math.abs(this.pos.x1 - this.pos.x2),
        h: Math.abs(this.pos.y1 - this.pos.y2) + 30     // FIXME
      }
    },

    pos () {
      return {
        x1: this.topic.viewProps['zukunftswerk.x1'],
        y1: this.topic.viewProps['zukunftswerk.y1'],
        x2: this.topic.viewProps['zukunftswerk.x2'],
        y2: this.topic.viewProps['zukunftswerk.y2']
      }
    },

    selectedTopic () {
      return this.$store.state.topic
    },

    zoom () {
      return this.$store.state.zoom
    }
  }
}
</script>

<style>
.zw-arrow .svg {
  overflow: visible;
}

.zw-arrow .handle {
  margin-top: -6px;
  margin-left: -6px;
}
</style>
