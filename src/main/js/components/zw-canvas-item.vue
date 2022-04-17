<template>
  <vue-draggable-resizable class="zw-canvas-item" :x="topic.pos.x" :y="topic.pos.y" :w="w" :h="h" :scale="zoom"
      :draggable="isTeam" :resizable="resizable" :handles="handles" @activated="select" @dragstop="setPos"
      @resizestop="setSize" @dragging="dragging" @resizing="resizing">
    <component class="item-content" :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode"
      @mousedown.native="mousedown" @resize-style="setResizeStyle">
    </component>
    <div class="button-panel" v-if="buttonPanelVisibility">
      <el-button type="text" :style="buttonStyle" @click="edit" @mousedown.native.stop>
        <zw-string>action.edit</zw-string>
      </el-button>
      <el-button type="text" :style="buttonStyle" @click="deleteItem" @mousedown.native.stop>
        <zw-string>action.delete</zw-string>
      </el-button>
    </div>
  </vue-draggable-resizable>
</template>

<script>
import dmx from 'dmx-api'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

export default {

  mixins: [
    require('./mixins/dragging').default
  ],

  props: {

    topic: {                    // the topic to render (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },

    mode: {                     // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  data () {
    return {
      resizeStyle: 'x',         // 'x'/'xy'/'none'
      topicBuffer: undefined,   // The edit buffer (dmx.ViewTopic),
      hasDragStarted: false     // Tracks if an actual drag happened after mousedown. If not we don't dispatch any
                                // "drag" action at all. We must never dispatch "dragStart" w/o a corresponding
                                // "dragStop".
    }
  },

  computed: {

    w () {
      return this.topic.viewProps['dmx.topicmaps.width']
    },

    h () {
      return this.resizeStyle === 'x' ? 'auto' : this.topic.viewProps['dmx.topicmaps.height']
    },

    resizable () {
      return this.resizeStyle !== 'none' && this.isTeam
    },

    handles () {
      return this.resizeStyle === 'x' ? ['mr'] : ['mr', 'bm', 'br']
    },

    buttonPanelVisibility () {
      return this.infoMode && this.isTeam
    },

    buttonStyle () {
      return {
        'font-size': `${14 / this.zoom}px`      // "14" corresponds to --primary-font-size (see App.vue)
      }
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    zoom () {
      return this.$store.state.zoom
    },

    infoMode () {
      return this.mode === 'info'
    }
  },

  watch: {
    zoom () {
      this.adjustHandles()
    }
  },

  methods: {

    select (e) {
      this.adjustHandles()
      this.$store.dispatch('setTopic', this.topic)
    },

    edit () {
      // "allChildren" is required to keep the file's "Media Type". Note: Media Type is required for file rendering,
      // but it would be omitted/dropped due to "Reduced Details" as it is not an identity attribute. ### FIXDOC
      this.topicBuffer = this.topic.type.newFormModel(this.topic.clone(), true)     // allChildren=true
      this.$store.dispatch('edit', this.topic)
    },

    // Note: can't be named "delete"
    deleteItem () {
      this.$store.dispatch('delete', this.topic)
    },

    mousedown (e) {
      const inInput = e.target.tagName === 'INPUT'
      const inQuill = e.target.closest('.ql-container')
      // FIXME: handle el-upload fields?
      // console.log('mousedown', inInput, inQuill)
      if (inInput || inQuill) {
        e.stopPropagation()     // prevent vue-draggable-resizable from initiating a drag
      }
    },

    dragging () {
      if (!this.hasDragStarted) {
        this.hasDragStarted = true
        this.dragStart()
      }
    },

    resizing () {
      this.dragging()
      if (this.resizeStyle === 'x') {
        this.$el.style.height = 'auto'
      }
    },

    setPos (x, y) {
      this.dragStop()
      this.hasDragStarted = false
      this.$store.dispatch('setTopicPos', {topic: this.topic, x, y})
    },

    setSize (x, y, width, height) {
      this.dragStop()
      this.hasDragStarted = false
      this.$store.dispatch('setTopicSize', {topic: this.topic, width, height})
    },

    setResizeStyle (style) {
      this.resizeStyle = style
    },

    adjustHandles () {
      document.querySelectorAll('.handle').forEach(handle => {
        handle.style.transform = `scale(${1 / this.zoom}) translate(${1 / this.zoom}px, ${1 / this.zoom}px)`
      })
    }
  },

  components: {
    'zukunftswerk.document': require('./zw-document').default,
    'zukunftswerk.note': require('./zw-note').default,
    'zukunftswerk.label': require('./zw-label').default,
    'zukunftswerk.arrow': require('./zw-arrow').default
  }
}
</script>

<style>
.zw-canvas-item.vdr {                       /* "vdr" class is added by vdr */
  border: 1px solid transparent;            /* vdr default border is "1px dashed #000" */
}

.zw-canvas-item.active {                    /* "active" class is added by vdr */
  border: 1px dashed #aaa;
}

.zw-canvas-item.dragging .item-content,     /* "dragging" class is added by vdr */
.zw-canvas-item.resizing .item-content {    /* "resizing" class is added by vdr */
  pointer-events: none;                     /* prevent interaction with PDF renderer while dragging/resizing */
}

.zw-canvas-item .button-panel {
  position: absolute;
  visibility: hidden;
  z-index: 1;                               /* place button panel before other canvas items */
}

.zw-canvas-item:hover .button-panel {
  visibility: visible;
}
</style>
