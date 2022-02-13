<template>
  <vue-draggable-resizable class="zw-canvas-item" :x="topic.pos.x" :y="topic.pos.y" :w="w" :h="h" :handles="handles"
      :scale="zoom" :on-drag-start="onDragStart" @activated="select" @dragstop="setPos" @resizestop="setSize"
      @resizing="adjustHeight">
    <component :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode" @mousedown.native="mousedown"
      @resize-style="setResizeStyle">
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
      w: this.topic.viewProps['dmx.topicmaps.width'],
      resizeStyle: 'x',         // 'x'/'xy'
      topicBuffer: undefined    // the edit buffer (dmx.ViewTopic)
    }
  },

  computed: {

    h () {
      return this.resizeStyle === 'x' ? 'auto' : this.topic.viewProps['dmx.topicmaps.height']
    },

    handles () {
      return this.resizeStyle === 'x' ? ['mr'] : ['mr', 'bm', 'br']
    },

    buttonPanelVisibility () {
      return this.infoMode && this.isWritable
    },

    buttonStyle () {
      return {
        'font-size': `${14 / this.zoom}px`    // 14 = --main-font-size (see App.vue)
      }
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    zoom () {
      return this.$store.state.zoom
    },

    infoMode () {
      return this.mode === 'info'
    }
  },

  methods: {

    select (e) {
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

    onDragStart () {
      this.dragStart()
    },

    mousedown (e) {
      // console.log('mousedown', e.target.tagName)
      const inInput = e.target.tagName === 'INPUT'
      const inQuill = e.target.closest('.ql-container')
      if (inInput || inQuill) {
        e.stopPropagation()     // prevent vue-draggable-resizable from initiating a drag ### FIXME?
      }
    },

    setPos (x, y) {
      this.dragStop()
      //
      const pos = {x, y}
      this.topic.setPosition(pos)                                           // update client state
      if (this.topic.id >= 0 && this.isWritable) {
        dmx.rpc.setTopicPosition(this.topicmap.id, this.topic.id, pos)      // update server state
      }
    },

    setSize (x, y, width, height) {
      if (this.topic.id >= 0 && this.isWritable) {
        if (!isNaN(width) && !isNaN(height)) {
          dmx.rpc.setTopicViewProps(this.topicmap.id, this.topic.id, {
            'dmx.topicmaps.width': width,
            'dmx.topicmaps.height': height
          })
        }
      }
    },

    setResizeStyle (style) {
      this.resizeStyle = style
    },

    adjustHeight () {
      if (this.resizeStyle === 'x') {
        this.$el.style.height = 'auto'
      }
    }
  },

  components: {
    'zukunftswerk.document': require('./zw-document').default,
    'zukunftswerk.note': require('./zw-note').default,
    'zukunftswerk.label': require('./zw-label').default,
    'zukunftswerk.arrow': require('./zw-arrow').default,
    'vue-draggable-resizable': require('vue-draggable-resizable')
  }
}
</script>

<style>
.zw-canvas-item.vdr {
  border: 1px solid white;      /* vdr default border is "1px dashed #000" */
}

.zw-canvas-item.active {
  border: 1px dashed #aaa;
}

.zw-canvas-item .button-panel {
  position: absolute;
  visibility: hidden;
  z-index: 1;                   /* place button panel before other canvas items */
}

.zw-canvas-item:hover .button-panel {
  visibility: visible;
}
</style>
