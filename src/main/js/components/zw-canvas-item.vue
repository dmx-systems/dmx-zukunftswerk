<template>
  <div :class="['zw-canvas-item', customClass, mode, {selected: isSelected, draggable}]" :data-id="topic.id"
      :style="style">
    <component class="item-content" :is="topic.typeUri" :topic="topic" :topic-buffer="topicBuffer" :mode="mode"
      @custom-class="setCustomClass" @action="addAction" @actions="setActions" @edit-enabled="setEditEnabled"
      @resize-style="setResizeStyle" @get-size="setGetSizeHandler" @mousedown.native="mousedown">
    </component>
    <div class="lock-icon el-icon-lock" v-if="showLock"></div>
    <div class="item-toolbar" v-if="infoMode">
      <el-button v-for="action in actions" v-if="isActionAvailable(action)" type="text" :style="buttonStyle"
          :key="action.action" @click="action.handler" @mousedown.native.stop>
        {{actionLabel(action.action)}}
      </el-button>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/selection').default,
    require('./mixins/editable').default,
    require('./mixins/zoom').default
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
      topicBuffer: undefined,   // The edit buffer, available only in edit mode (dmx.ViewTopic)
      // Default configuration, can be (partially) supplied by child component      TODO: move config to canvas
      customClass: undefined,   // Custom class (String)
      actions: [                // Actions appearing in the button panel
        {action: 'action.edit',   handler: this.edit},
        {action: 'action.lock',   handler: this.toggleLock},
        {action: 'action.delete', handler: this.deleteItem}
      ],
      editEnabled: true,        // Edit button visibility (Boolean)
      resizeStyle: 'x',         // 'x'/'xy'/'none' (String)
      getSize: undefined        // Custom get-size function (Function)
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

    locked () {
      return this.topic.children['zukunftswerk.locked']?.value
    },

    showLock () {
      return this.editable && this.locked
    },

    isEditableItem () {
      return this.isTeam || this.isEditor && !this.locked
    },

    draggable () {
      return this.isEditableItem
    },

    topicmap () {
      return this.$store.state.topicmap
    }
  },

  methods: {

    edit () {
      // "allChildren" is required to keep the file's "Media Type". Note: Media Type is required for file rendering,
      // but it would be omitted/dropped due to "Reduced Details" as it is not an identity attribute. ### FIXDOC
      this.topicBuffer = this.topic.type.newFormModel(this.topic.clone(), true)     // allChildren=true
      this.$store.dispatch('edit', this.topic)
    },

    toggleLock () {
      this.$store.dispatch('toggleLock', this.topic)
    },

    // Note: can't be named "delete"
    deleteItem () {
      this.$store.dispatch('delete', this.topic)
    },

    mousedown (e) {
      const inInput = e.target.tagName === 'INPUT'
      const inQuill = e.target.closest('.ql-container')
      // TODO: handle el-upload fields as well
      if (inInput || inQuill) {
        e.stopPropagation()     // prevent vue-moveable from initiating a drag
      }
    },

    isActionAvailable (action) {
      return (this.isEditableItem || action.enabledForReadOnly) && (action.action !== 'action.edit' || this.editEnabled)
                                                                && (action.action !== 'action.lock' || this.isTeam)
    },

    actionLabel (action) {
      const key = action === 'action.lock' && this.locked ? 'action.unlock' : action
      return zw.getString(key)
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
    'zukunftswerk.textblock': require('./zw-textblock').default,
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

.zw-canvas-item.zw-arrow {
  z-index: 1 !important;                    /* Place arrows before other canvas items */
}

.zw-canvas-item.form {                      /* Place forms before arrows */
  z-index: 2 !important;
}

.zw-canvas-item.selected {                  /* Place the selected item (including button panel) in front */
  z-index: 3 !important;
}

.zw-canvas-item.draggable {
  cursor: grab;
}

.zw-canvas-item .item-toolbar {
  position: absolute;
  visibility: hidden;
  padding-top: 4px;
  padding-bottom: 12px;
}

.zw-canvas-item:hover .item-toolbar {
  visibility: visible;
}

.zw-canvas-item .lock-icon {
  position: absolute;
  right: 2px;
  bottom: 2px;
}
</style>
