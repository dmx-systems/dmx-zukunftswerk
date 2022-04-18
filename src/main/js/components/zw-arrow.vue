<template>
  <div><!-- Note: class "zw-arrow" is located at parent -->
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" class="svg">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#909399" />
        </marker>
      </defs>
      <line :x1="pos.x1" :y1="pos.y1" :x2="pos.x2" :y2="pos.y2" stroke="#909399" stroke-width="8"
        marker-end="url(#arrowhead)" />
    </svg>
    <div class="handles" v-if="selected">
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x1" :y="pos.y1" :w="10" :h="10" :scale="zoom"
        @dragging="dragging1" @dragstop="handleMoved" @mousedown.native.stop>
      </vue-draggable-resizable>
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x2" :y="pos.y2" :w="10" :h="10" :scale="zoom"
        @dragging="dragging2" @dragstop="handleMoved" @mousedown.native.stop>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mixins: [
    require('./mixins/dragging').default
  ],

  created () {
    // console.log('zw-arrow', this.topic.pos, this.pos, this.size)
    this.$emit('custom-class', 'zw-arrow')
    this.$emit('edit-enabled', false)
    this.$emit('resize-style', 'none')
    this.$emit('get-size', () => this.size)
  },

  props: {
    topic: {                  // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  data () {
    return {
      dragging1: this.draggingHandler(1),
      dragging2: this.draggingHandler(2),
      hasDragStarted: false,    // Tracks if a handle is actually dragged after mousedown. If not we don't dispatch
                                // any "drag" action at all. We must never dispatch "dragStart" w/o a corresponding
                                // "dragStop".
      dragPos: undefined
    }
  },

  computed: {

    viewBox () {
      // console.log('viewBox', `0 0 ${this.size.w} ${this.size.h}`)
      return `0 0 ${this.size.w} ${this.size.h}`
    },

    size () {
      // console.log('size', Math.abs(this.pos.x1 - this.pos.x2))
      return {
        w: Math.abs(this.pos.x1 - this.pos.x2) + 30,    // +30 FIXME
        h: Math.abs(this.pos.y1 - this.pos.y2) + 30
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

    selected () {
      return this.selectedTopic?.id === this.topic.id
    },

    selectedTopic () {
      return this.$store.state.topic
    },

    zoom () {
      return this.$store.state.zoom
    }
  },

  methods: {

    draggingHandler (handle) {
      return (x, y) => {
        const pos = this.topic.pos
        if (!this.hasDragStarted) {
          this.hasDragStarted = true
          this.dragPos = pos
          this.dragStart()
        }
        const cx = this.dragPos.x - pos.x
        const cy = this.dragPos.y - pos.y
        // console.log(cx, cy)
        const otherX = this.pos[`x${3 - handle}`]
        const otherY = this.pos[`y${3 - handle}`]
        const left = Math.min(x + cx, otherX)
        const top  = Math.min(y + cy, otherY)
        // update client state
        this.topic.setViewProp(`zukunftswerk.x${handle}`, x - left)
        this.topic.setViewProp(`zukunftswerk.y${handle}`, y - top)
        this.topic.setViewProp(`zukunftswerk.x${3 - handle}`, otherX - left)
        this.topic.setViewProp(`zukunftswerk.y${3 - handle}`, otherY - top)
        this.topic.setViewProp('dmx.topicmaps.width', Math.abs(x - otherX))
        this.topic.setPosition({x: pos.x + left, y: pos.y + top})
      }
    },

    handleMoved (x, y) {
      // console.log('handleMoved', x, y)
      this.dragStop()
      this.hasDragStarted = false
      this.$store.dispatch('storeTopicViewProps', this.topic)
    }
  }
}
</script>

<style>
.zw-arrow .svg {
  overflow: visible;
}

.zw-arrow .handle {
  top: 0;
  left: 0;
  margin-top: -6px;
  margin-left: -6px;
}
</style>
