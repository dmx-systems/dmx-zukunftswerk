<template>
  <div :class="['zw-canvas-item', customClass, mode, dragMode, {selected: isSelected, draggable}]" :data-id="topic.id"
      :style="style" @mousedown="select">
    <component class="item-content" :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode"
      @custom-class="setCustomClass" @action="addAction" @actions="setActions" @edit-enabled="setEditEnabled"
      @rotate-enabled="setRotateEnabled" @resize-style="setResizeStyle" @get-size="setGetSizeHandler"
      @move-handler="setMoveHandler" @mousedown.native="mousedown">
    </component>
    <div class="button-panel" v-if="infoMode">
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

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/selection').default,
    require('./mixins/dragging').default,
    require('./mixins/editable').default
  ],

  mounted () {
    this.moveable = this.newMovable()
  },

  destroyed () {
    this.moveable.destroy()
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
      customClass: undefined,   // Custom class (String)
      actions: [                // Actions appearing in the button panel
        {action: 'action.edit',   handler: this.edit},
        {action: 'action.delete', handler: this.deleteItem}
      ],
      editEnabled: true,        // Edit button visibility (Boolean)
      rotateEnabled: true,      // Rotate handle visibility (Boolean)
      resizeStyle: 'x',         // 'x'/'xy'/'none' (String)
      getSize: undefined,       // Custom get-size function (Function)
      moveHandler: undefined,   // Custom handler to react on item moves (Function)
      //
      // Misc
      topicBuffer: undefined,   // The edit buffer (dmx.ViewTopic)
      moveable: undefined,      // The Moveable instance
      dragMode: undefined,      // While a drag is in progress: one of 'dragging', 'resizing', 'rotating'.
                                // Also used to detect if an actual drag happened after mousedown. If not we don't
                                // dispatch any "drag" action at all. We must never dispatch "dragStart" w/o a
                                // corresponding "dragStop".
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
      return this.formMode && zw.FORM_WIDTH || this.getSize && this.getSize().w
                                            || this.topic.viewProps['dmx.topicmaps.width']
    },

    h () {
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

    handles () {
      switch (this.resizeStyle) {
        case 'x':  return ['e']
        case 'xy': return ['e', 's', 'se']
      }
    },

    buttonStyle () {
      return {
        'font-size': `${14 / this.zoom}px`      // "14" matches --primary-font-size (see App.vue)
      }
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    zoom () {
      return this.$store.state.zoom
    }
  },

  watch: {
    mode () {
      this.$store.dispatch('updateControlBox', {topicId: this.topic.id, delay: 300})
    }
  },

  methods: {

    select (e) {
      this.$store.dispatch('select', this.topic)
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
        className: `target-${this.topic.id}`,   // Note: (data-)attributes are not supported, so we use a class instead
        target: this.$el,
        draggable: this.draggable,
        resizable: this.resizable,
        rotatable: this.rotatable,
        origin: false
      })
      moveable.renderDirections = this.handles
      /* draggable */
      moveable.on('drag', ({left, top}) => {
        this.dragging('dragging')
        this.topic.setPosition({x: left, y: top})     // update client state
        this.moveHandler && this.moveHandler()
      }).on('dragEnd', () => {
        this.dragEnd()
        this.storePos()
      })
      /* resizable */
      moveable.on('resize', ({target, width, height}) => {
        this.dragging('resizing')
        // Note: for width measurement "moveable" relies on an up-to-date *view*.
        // In contrast updating the *model* (view props) updates the view asynchronously.
        target.style.width = `${width}px`
        this.topic.setViewProp('dmx.topicmaps.width', width)
        // this.topic.setViewProp('dmx.topicmaps.height', height)                 // FIXME: 'auto'
        // this.$el.style.height = `${this.h}${this.h !== 'auto' ? 'px' : ''}`    // FIXME?
      }).on('resizeEnd', () => {
        this.dragEnd()
        this.storeSize()
      });
      /* rotatable */
      moveable.on('rotate', ({target, transform}) => {
        this.dragging('rotating')
        target.style.transform = transform;
        const angle = Number(transform.match(/rotate\(([-.\d]*)deg\)/)[1])
        this.topic.setViewProp('zukunftswerk.angle', angle)
      }).on('rotateEnd', () => {
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
      if (inInput || inQuill) {
        e.stopPropagation()     // prevent vue-draggable-resizable from initiating a drag
      }
    },

    dragging (dragMode) {
      if (!this.dragMode) {
        this.dragMode = dragMode
        this.dragStart()
      }
      document.querySelector(`.moveable-control-box.target-${this.topic.id}`).classList.add('active')     // TODO: DRY
    },

    dragEnd () {
      this.dragStop()
      this.dragMode = undefined
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

    buttonVisibility (action) {
      return (this.editable || action.enabledForReadOnly) && (action.action !== 'action.edit' || this.editEnabled)
    },

    setCustomClass (classname) {
      this.customClass = classname
    },

    addAction (action) {
      this.actions.push(action)
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
    },

    setMoveHandler (handler) {
      this.moveHandler = handler
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
  z-index: 1 !important;                    /* Place arrows before other canvas items */
}

.zw-canvas-item.selected,                   /* Place the selected item (including button panel) in front, even    */
.zw-canvas-item.form {                      /* before arrows. Forms are always in front, regardless of selection. */
  z-index: 2 !important;
}

.zw-canvas-item.draggable {
  cursor: grab;
}

.zw-canvas-item.dragging {
  cursor: grabbing;
}

.zw-canvas-item.dragging .item-content,
.zw-canvas-item.resizing .item-content {
  pointer-events: none;                     /* Prevent interaction with PDF renderer while dragging/resizing */
}

.zw-canvas-item .button-panel {
  position: absolute;
  visibility: hidden;
}

.zw-canvas-item:hover .button-panel {
  visibility: visible;
}
</style>
