<template>
  <div :class="['zw-canvas-item', customClass, mode]" v-if="visibilty" :style="style" @click.stop="select">
    <component class="item-content" :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode"
      @visibility="setVisibility" @custom-class="setCustomClass" @actions="setActions" @edit-enabled="setEditEnabled"
      @rotate-enabled="setRotateEnabled" @resize-style="setResizeStyle" @get-size="setGetSizeHandler"
      @mousedown.native="mousedown">
    </component>
    <div class="button-panel" v-if="buttonPanelVisibility">
      <el-button v-for="action in actions" v-if="buttonVisibility(action)" type="text" :style="buttonStyle"
          :key="action.action" @click="action.handler" @mousedown.native.stop>
        <zw-string>{{action.action}}</zw-string>
      </el-button>
    </div>
  </div>
</template>

<script>
import Moveable from 'moveable'
import dmx from 'dmx-api'
import zw from '../zw-globals'
// import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/dragging').default
  ],

  mounted () {
    if (this.editable) {
      this.moveable = this.newMovable()
    }
  },

  destroyed () {
    if (this.editable) {
      this.moveable.destroy()
    }
  },

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
      // Default configuration, can be (partially) supplied by child component
      visibilty: true,          // Is this item visible? (Boolean)
      customClass: undefined,   // Custom class (String)
      actions: [                // Actions appearing in the button panel
        {action: 'action.edit',   handler: this.edit},
        {action: 'action.delete', handler: this.deleteItem}
      ],
      editEnabled: true,        // Edit button visibility (Boolean)
      rotateEnabled: true,      // Rotate handle visibility (Boolean)
      resizeStyle: 'x',         // 'x'/'xy'/'none' (String)
      getSize: undefined,       // Custom get-size function (Function)
      //
      // Misc
      topicBuffer: undefined,   // The edit buffer (dmx.ViewTopic)
      moveable: undefined,      // The Moveable instance
      hasDragStarted: false     // Tracks if an actual drag happened after mousedown. If not we don't dispatch any
                                // "drag" action at all. We must never dispatch "dragStart" w/o a corresponding
                                // "dragStop".
    }
  },

  computed: {

    style () {
      return {
        top: `${this.y}px`,
        left: `${this.x}px`,
        width: `${this.w}px`,
        height: `${this.h}${this.h !== 'auto' ? 'px' : ''}`,
        transform: `rotate(${this.angle}deg)`
      }
    },

    x () {
      return this.topic.pos.x
    },

    y () {
      return this.topic.pos.y
    },

    w () {
      // console.log('w', this.formMode, this.topic.viewProps['dmx.topicmaps.width'])
      return this.formMode && zw.FORM_WIDTH || this.getSize && this.getSize().w
                                            || this.topic.viewProps['dmx.topicmaps.width']
    },

    h () {
      // console.log('h', this.getSize, this.getSize && this.getSize().h)
      return this.getSize && this.getSize().h || this.resizeStyle === 'x' ? 'auto' :
                                                 this.topic.viewProps['dmx.topicmaps.height']
    },

    angle () {
      return this.topic.viewProps['zukunftswerk.angle'] || 0
    },

    draggable () {
      return this.editable
    },

    resizable () {
      return this.editable && this.resizeStyle !== 'none'
    },

    rotatable () {
      return this.editable && this.rotateEnabled
    },

    buttonPanelVisibility () {
      return this.editable && this.infoMode
    },

    editable () {
      return this.isTeam || this.isEditor
    },

    handles () {
      switch (this.resizeStyle) {
        case 'x':  return ['e']
        case 'xy': return ['e', 's', 'se']
      }
    },

    buttonStyle () {
      return {
        'font-size': `${14 / this.zoom}px`      // "14" corresponds to --primary-font-size (see App.vue)
      }
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    isEditor () {
      return this.$store.state.isEditor
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    zoom () {
      return this.$store.state.zoom
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

    newMovable () {
      const moveable = new Moveable(document.querySelector('.zw-canvas .content-layer'), {
        className: `target-${this.topic.id}`,
        target: this.$el,
        draggable: this.draggable,
        resizable: this.resizable,
        rotatable: this.rotatable,
        origin: false
      })
      moveable.renderDirections = this.handles
      /* draggable */
      moveable.on("dragStart", ({target, clientX, clientY}) => {
        this.select()     // programmatic selection
      }).on("drag", ({
        target, transform, left, top, right, bottom, beforeDelta, beforeDist, delta, dist, clientX, clientY
      }) => {
        this.dragging()
        this.topic.setPosition({x: left, y: top})     // update client state
        // target!.style.transform = transform;
      }).on("dragEnd", ({target, isDrag, clientX, clientY}) => {
        this.dragEnd()
        this.storePos()
      })
      /* resizable */
      moveable.on("resizeStart", ({target, clientX, clientY}) => {
        this.select()     // programmatic selection
      }).on("resize", ({target, width, height, dist, delta, clientX, clientY}) => {
        this.dragging()
        // Note: for width measurement "moveable" relies on an up-to-date *view*.
        // In contrast updating the *model* (view props) updates the view asynchronously.
        target.style.width = `${width}px`
        this.topic.setViewProp('dmx.topicmaps.width', width)
        // this.topic.setViewProp('dmx.topicmaps.height', height)                 // FIXME: 'auto'
        // this.$el.style.height = `${this.h}${this.h !== 'auto' ? 'px' : ''}`    // FIXME?
      }).on("resizeEnd", ({target, isDrag, clientX, clientY}) => {
        this.dragEnd()
        this.storeSize()
      });
      /* rotatable */
      moveable.on("rotateStart", ({target, clientX, clientY}) => {
        this.select()     // programmatic selection
      }).on("rotate", ({target, beforeDelta, delta, dist, transform, clientX, clientY}) => {
        this.dragging()
        target.style.transform = transform;
        const angle = Number(transform.match(/rotate\(([-.\d]*)deg\)/)[1])
        this.topic.setViewProp('zukunftswerk.angle', angle)
      }).on("rotateEnd", ({target, isDrag, clientX, clientY}) => {
        this.dragEnd()
        this.storeAngle()
      });
      //
      return moveable
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
      document.querySelector(`.moveable-control-box.target-${this.topic.id}`).classList.add('active')   // TODO: DRY
    },

    dragEnd () {
      this.dragStop()
      this.hasDragStarted = false
      this.$nextTick(() => {
        document.querySelector(`.moveable-control-box.target-${this.topic.id}`).classList.add('active')   // TODO: DRY
      })
    },

    storePos () {
      this.$store.dispatch('storeTopicPos', this.topic)
    },

    storeSize () {
      this.$store.dispatch('storeTopicSize', this.topic)
    },

    storeAngle () {
      this.$store.dispatch('storeTopicAngle', this.topic)
    },

    setVisibility (visibilty) {
      this.visibilty = visibilty
    },

    setCustomClass (classname) {
      this.customClass = classname
    },

    buttonVisibility (action) {
      return action.action !== 'action.edit' || this.editEnabled
    },

    setActions (actions) {
      this.actions = actions
    },

    setEditEnabled (enabled) {
      this.editEnabled = enabled
    },

    setRotateEnabled (enabled) {
      this.rotateEnabled = enabled
    },

    setResizeStyle (style) {
      this.resizeStyle = style
    },

    setGetSizeHandler (handler) {
      this.getSize = handler
    }
  },

  components: {
    'zukunftswerk.document': require('./zw-document').default,
    'zukunftswerk.note': require('./zw-note').default,
    'zukunftswerk.label': require('./zw-label').default,
    'zukunftswerk.arrow': require('./zw-arrow').default,
    'zukunftswerk.viewport': require('./zw-viewport').default
  }
}
</script>

<style>
.zw-canvas-item {
  position: absolute;
}

.moveable-control-box {
  display: none !important;
}

.moveable-control-box.active {
  display: block !important;
}

.zw-canvas-item.zw-arrow {
  z-index: 1 !important;                    /* place arrows before other canvas items */
}

.zw-canvas-item.active,                     /* When selected, place item (and button panel) before other */
.zw-canvas-item.form {                      /* canvas items, before arrows in particular.                */
  z-index: 2 !important;                    /* Note: forms are always in front, regardless of selection. */
}

.zw-canvas-item.draggable {                 /* "draggable" class is added by vdr TODO */
  cursor: grab;
}

.zw-canvas-item.dragging {
  cursor: grabbing;
}

.zw-canvas-item.dragging .item-content,     /* "dragging" class is added by vdr TODO */
.zw-canvas-item.resizing .item-content {    /* "resizing" class is added by vdr TODO */
  pointer-events: none;                     /* prevent interaction with PDF renderer while dragging/resizing */
}

.zw-canvas-item .button-panel {
  position: absolute;
  visibility: hidden;
}

.zw-canvas-item:hover .button-panel {
  visibility: visible;
}
</style>
