<template>
  <div :class="['zw-canvas-item', customClass, mode]" v-if="visibilty" :style="style"
      :scale="zoom" :active="isSelected" :draggable="draggable" :resizable="resizable"
      @activated="select" @deactivated="deselect">
    <component class="item-content" :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode"
      @visibility="setVisibility" @custom-class="setCustomClass" @resize-style="setResizeStyle"
      @get-size="setGetSizeHandler" @actions="setActions" @edit-enabled="setEditEnabled" @adjust-handles="adjustHandles"
      @mousedown.native="mousedown">
    </component>
    <div class="button-panel" v-if="editable">
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
    require('./mixins/selection').default,
    require('./mixins/dragging').default
  ],

  mounted () {
    const moveable = new Moveable(document.querySelector('.zw-canvas .content-layer'), {
      target: this.$el,
      draggable: true,    // TODO
      resizable: true,    // TODO
      rotatable: true     // TODO
    })
    moveable.renderDirections = this.handles
    /* draggable */
    moveable.on("dragStart", ({target, clientX, clientY}) => {
      // console.log("onDragStart")
    }).on("drag", ({
      target, transform, left, top, right, bottom, beforeDelta, beforeDist, delta, dist, clientX, clientY
    }) => {
      // console.log("onDrag left, top, transform", left, top, transform);
      this.dragging()
      this.topic.setPosition({x: left, y: top})     // update client state
      // console.log("onDrag translate", dist);
      // target!.style.transform = transform;
    }).on("dragEnd", ({target, isDrag, clientX, clientY}) => {
      // console.log("onDragEnd", isDrag)
      this.setPos()
    })
    /* resizable */
    moveable.on("resizeStart", ({target, clientX, clientY}) => {
        // console.log("onResizeStart");
    }).on("resize", ({target, width, height, dist, delta, clientX, clientY}) => {
        // console.log("onResize", width, height, dist, delta);
        this.dragging()
        // Note: for width measurement "moveable" relies on an up-to-date *view*.
        // In contrast updating the *model* (view props) updates the view asynchronously.
        target.style.width = `${width}px`
        this.topic.setViewProp('dmx.topicmaps.width', width)
        // this.topic.setViewProp('dmx.topicmaps.height', height)                 // FIXME: 'auto'
        // this.$el.style.height = `${this.h}${this.h !== 'auto' ? 'px' : ''}`    // FIXME?
    }).on("resizeEnd", ({target, isDrag, clientX, clientY}) => {
        // console.log("onResizeEnd", isDrag)
        this.setSize()
    });
    /* rotatable */
    moveable.on("rotateStart", ({target, clientX, clientY}) => {
        // console.log("onRotateStart");
        this.dragging()
    }).on("rotate", ({target, beforeDelta, delta, dist, transform, clientX, clientY}) => {
        // console.log("onRotate", transform, beforeDelta, delta, dist);
        target.style.transform = transform;
        const angle = Number(transform.match(/rotate\(([-.\d]*)deg\)/)[1])
        // console.log(angle)
        this.topic.setViewProp('zukunftswerk.angle', angle)
    }).on("rotateEnd", ({target, isDrag, clientX, clientY}) => {
        // console.log("onRotateEnd", isDrag);
        this.setAngle()
    });
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
      resizeStyle: 'x',         // 'x'/'xy'/'none' (String)
      getSize: undefined,       // Custom get-size function (Function)
      //
      // Misc
      topicBuffer: undefined,   // The edit buffer (dmx.ViewTopic),
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
      return this.isTeam || this.isEditor
    },

    resizable () {
      return this.resizeStyle !== 'none' && (this.isTeam || this.isEditor)
    },

    editable () {
      return this.infoMode && (this.isTeam || this.isEditor)
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

    // needed?
    pan () {
      return this.$store.state.pan
    },

    zoom () {
      return this.$store.state.zoom
    }
  },

  watch: {
    zoom () {
      this.adjustHandles()
    }
  },

  methods: {

    select (e) {
      this.$store.dispatch('setTopic', this.topic)
      this.$nextTick(() => {
        this.adjustHandles()
      })
    },

    deselect (e) {
      this.$store.dispatch('setTopic', undefined)
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

    setPos () {
      this.dragStop()
      this.hasDragStarted = false
      this.$store.dispatch('storeTopicPos', this.topic)
    },

    setSize () {
      this.dragStop()
      this.hasDragStarted = false
      this.$store.dispatch('storeTopicSize', this.topic)
    },

    setAngle () {
      this.dragStop()
      this.hasDragStarted = false
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

    setResizeStyle (style) {
      this.resizeStyle = style
    },

    setGetSizeHandler (handler) {
      this.getSize = handler
    },

    adjustHandles () {
      document.querySelectorAll('.handle').forEach(handle => {
        const x = Number(handle.dataset.x)
        const y = Number(handle.dataset.y)
        if (isNaN(x) || isNaN(y)) {
          // regular vdr handle
          handle.style.transform = `scale(${1 / this.zoom}) translate(${1 / this.zoom}px, 0)`
        } else {
          // custom zw-arrow handle
          handle.style.transform = `scale(${1 / this.zoom}) translate(${x * this.zoom}px, ${y * this.zoom}px)`
        }
      })
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

.zw-canvas-item.vdr,                        /* "vdr" class is added by vdr */
.zw-canvas-item.vdr.zw-arrow {              /* arrows never get a border (but 2 handles), even when active */
  border: 1px solid transparent;            /* vdr default border is "1px dashed #000" */
}

.zw-canvas-item.vdr.zw-arrow {
  z-index: 1 !important;                    /* place arrows before other canvas items */
}

.zw-canvas-item.active {                    /* "active" class is added by vdr */
  border: 1px dashed #aaa;
}

.zw-canvas-item.active,                     /* When selected, place item (and button panel) before other */
.zw-canvas-item.form {                      /* canvas items, before arrows in particular.                */
  z-index: 2 !important;                    /* Note: forms are always in front, regardless of selection. */
}

.zw-canvas-item.draggable {                 /* "draggable" class is added by vdr */
  cursor: grab;
}

.zw-canvas-item.dragging {
  cursor: grabbing;
}

.zw-canvas-item.dragging .item-content,     /* "dragging" class is added by vdr */
.zw-canvas-item.resizing .item-content {    /* "resizing" class is added by vdr */
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
