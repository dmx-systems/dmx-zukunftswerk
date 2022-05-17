<template>
  <div><!-- Note: class "zw-arrow" is located at parent -->
    <svg class="svg" xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#909399" />
        </marker>
      </defs>
      <line :x1="pos.x1" :y1="pos.y1" :x2="pos.x2" :y2="pos.y2" stroke="#909399" stroke-width="6"
        marker-end="url(#arrowhead)" />
    </svg>
    <div class="handles" v-if="editable">
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x1" :y="pos.y1" :w="10" :h="10" :scale="zoom"
        :data-x="pos.x1" :data-y="pos.y1" @dragging="dragging1" @dragstop="dragstop1" @mousedown.native.stop>
      </vue-draggable-resizable>
      <vue-draggable-resizable class="handle" :resizable="false" :x="pos.x2" :y="pos.y2" :w="10" :h="10" :scale="zoom"
        :data-x="pos.x2" :data-y="pos.y2" @dragging="dragging2" @dragstop="dragstop2" @mousedown.native.stop>
      </vue-draggable-resizable>
    </div>
  </div>
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
    this.$emit('resize-style', 'none')
    this.$emit('get-size', () => this.size)
  },

  props: {
    topic: {                    // the Arrow topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    }
  },

  data () {
    return {
      dragging1: this.draggingHandler(1),
      dragging2: this.draggingHandler(2),
      dragstop1: this.dragstopHandler(1),
      dragstop2: this.dragstopHandler(2),
      hasDragStarted: false,    // Tracks if a handle is actually dragged after mousedown. If not we don't dispatch
                                // any "drag" action at all. We must never dispatch "dragStart" w/o a corresponding
                                // "dragStop".
      dragPos: this.topic.pos
    }
  },

  computed: {

    viewBox () {
      return `0 0 ${this.size.w} ${this.size.h}`
    },

    size () {
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

    editable () {
      return this.isSelected && (this.isTeam || this.isEditor)
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    isEditor () {
      return this.$store.state.isEditor
    },

    zoom () {
      return this.$store.state.zoom
    }
  },

  methods: {

    draggingHandler (handle) {
      return (x, y) => {
        if (!this.hasDragStarted) {
          this.hasDragStarted = true
          this.dragStart()
        }
        const pos = this.topic.pos
        const cx = this.dragPos.x - pos.x     // coordinate system correction needed when container moves while dragging
        const cy = this.dragPos.y - pos.y     // coordinate system correction needed when container moves while dragging
        const otherX = this.pos[`x${3 - handle}`]
        const otherY = this.pos[`y${3 - handle}`]
        const left = Math.min(x + cx, otherX)
        const top  = Math.min(y + cy, otherY)
        // update client state
        this.topic.setPosition({x: pos.x + left, y: pos.y + top})
        this.topic.setViewProp(`zukunftswerk.x${handle}`, x - left)
        this.topic.setViewProp(`zukunftswerk.y${handle}`, y - top)
        this.topic.setViewProp(`zukunftswerk.x${3 - handle}`, otherX - left)
        this.topic.setViewProp(`zukunftswerk.y${3 - handle}`, otherY - top)
        // FIXME 1: "x" should actually be "x + cx", that is applying the correction, same for "y". The arrow would
        // properly follow the mouse pointer then, but not so the handle. This is because there is no way to make vdr
        // applying that correction when calculating the dragging position (the "transform" attribute's "translate"
        // value). The solution would be not utilizing vdr for the arrow handles but implement the dragging on our own.
        // vdr does not work well when the container moves while dragging.
        // FIXME 2: when dragging a handler in a zoomed view the handlers appear too big/too small. This is because
        // while a drag vdr overrides the handle's "transform" attribute (for translation), and thus removes the zoom
        // compensation (scale transform) as added by adjustHandles() (zw-canvas-item.vue). Again the solution would
        // be not utilizing vdr for the handles in order to gain full control over the transformations. vdr does not
        // work well when the app adds custom transformations to the item-to-be-dragged.
        //
        // update view
        // this.$emit('adjust-handles')   // TODO
      }
    },

    dragstopHandler (handle) {
      return (x, y) => {
        // console.log('dragstopHandler', x, y)
        this.dragStop()
        this.hasDragStarted = false
        this.$store.dispatch('storeTopicViewProps', this.topic)
      }
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
  cursor: move;
}
</style>
