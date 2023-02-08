<template>
  <div class="zw-canvas" :style="style" ref="canvas" @wheel="wheelZoom">
    <!-- Add menu -->
    <el-dropdown class="add-menu" v-if="editable" trigger="click" @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus" :title="addTooltip"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newDocument"><zw-string>item.document</zw-string></el-dropdown-item>
        <el-dropdown-item command="newNote"><zw-string>item.note</zw-string></el-dropdown-item>
        <el-dropdown-item command="newTextblock"><zw-string>item.textblock</zw-string></el-dropdown-item>
        <el-dropdown-item command="newLabel" divided><zw-string>item.label</zw-string></el-dropdown-item>
        <el-dropdown-item command="newArrow"><zw-string>item.arrow</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <el-button type="text" icon="el-icon-s-home" :title="homeTooltip" @click="home"></el-button>
      <el-button type="text" icon="el-icon-full-screen" :title="fullscreenTooltip" @click="zoomToFit"></el-button>
      <el-button type="text" icon="el-icon-zoom-in" :title="zoomInTooltip" @click="stepZoom(.1)"></el-button>
      <el-button type="text" icon="el-icon-zoom-out" :title="zoomOutTooltip" @click="stepZoom(-.1)"></el-button>
      <zw-canvas-search></zw-canvas-search>
    </div>
    <!-- Content layer -->
    <div :class="['content-layer', {transition}]" :style="viewportStyle" @transitionend="transitionend">
      <zw-canvas-item v-for="topic in topics" :topic="topic" :mode="mode(topic)" :key="topic.id"></zw-canvas-item>
      <zw-canvas-item v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-canvas-item>
      <vue-moveable ref="moveable" :target="targets" :draggable="draggable" :resizable="resizable"
        :rotatable="rotatable" :origin="false" :renderDirections="['e']" @dragStart="onDragStart" @drag="onDrag"
        @dragEnd="onDragEnd" @clickGroup="onClickGroup" @dragGroupStart="onDragGroupStart" @dragGroup="onDragGroup"
        @dragGroupEnd="onDragGroupEnd" @resize="onResize" @resizeEnd="onResizeEnd" @rotate="onRotate"
        @rotateEnd="onRotateEnd" @mouseenter.native="onEnter" @mouseleave.native="onLeave">
      </vue-moveable>
      <div class="group-toolbar" v-show="isMultiSelection && groupToolbarVisibility" :style="groupToolbarStyle"
          @mouseenter="onEnter" @mouseleave="onLeave">
        <el-button type="text" :style="buttonStyle" @click="deleteMany" @mousedown.native.stop>
          <zw-string :value="deleteCount">action.delete_many</zw-string>
        </el-button>
      </div>
    </div>
    <vue-selecto ref="selecto" :selectable-targets="['.content-layer .zw-canvas-item']" :selectFromInside="false"
      toggle-continue-select="shift" hitRate="0" @dragStart="onDragSelectStart" @select="onSelect"
      @selectEnd="onSelectEnd">
    </vue-selecto>
    <zw-arrow-handles></zw-arrow-handles>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'

let HEADER_HEIGHT
let synId = -1          // generator for temporary synthetic topic IDs, needed for topics not yet saved, counts down

export default {

  mixins: [
    require('./mixins/viewport').default,
    require('./mixins/selection').default,
    require('./mixins/editable').default,
    require('./mixins/zoom').default
  ],

  mounted () {
    HEADER_HEIGHT = document.querySelector('.zw-header').clientHeight
  },

  data () {
    return {
      DEFAULT: {
        resizeStyle: 'x',
        rotateEnabled: true,
        moveHandler: this.moveHandler
      },
      CONFIG: {
        'zukunftswerk.arrow': {
          resizeStyle: 'none',
          rotateEnabled: false,
          moveHandler: this.arrowMoveHandler
        },
        'zukunftswerk.viewport': {
          resizeStyle: 'none',
          rotateEnabled: false
        }
      },
      dragStartPos: undefined,          // object with x/y props TODO: needed? Operate on event "delta" instead?
      dragGroupStartPos: undefined,     // object, key: topicId, value: object with x/y props
      groupToolbarVisibility: false,
      groupToolbarPos: {x: 0, y: 0}     // object with x/y props
    }
  },

  computed: {

    style () {
      return {
        'background-position': `${this.bgPos.x}px ${this.bgPos.y}px`,
        'background-size': `${zw.CANVAS_GRID * this.zoom}px`
      }
    },

    groupToolbarStyle () {
      return {
        left: this.groupToolbarPos.x + 'px',
        top: this.groupToolbarPos.y + 'px'
      }
    },

    bgPos () {
      return  {
        x: this.pan.x % (zw.CANVAS_GRID * this.zoom),
        y: this.pan.y % (zw.CANVAS_GRID * this.zoom)
      }
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    topics () {
      return this.topicmap?.topics.filter(zw.canvasFilter) || []
    },

    targets () {
      return this.selection.map(topic => document.querySelector(`.zw-canvas-item[data-id="${topic.id}"]`))
    },

    deleteCount () {
      return this.selection.length
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

    resizeStyle () {
      return this.selectedTopic ? this.config('resizeStyle') : 'none'       // 'none' is group config
    },

    rotateEnabled () {
      return this.selectedTopic ? this.config('rotateEnabled') : false      // false is group config
    },

    newTopics () {
      return this.$store.state.newTopics
    },

    transition () {
      return this.$store.state.transition
    },

    lang () {
      return this.$store.state.lang
    },

    addTooltip () {
      return zw.getString('tooltip.add')
    },

    homeTooltip () {
      return zw.getString('tooltip.home')
    },

    fullscreenTooltip () {
      return zw.getString('tooltip.zoom_to_fit')
    },

    zoomInTooltip () {
      return zw.getString('tooltip.zoom_in')
    },

    zoomOutTooltip () {
      return zw.getString('tooltip.zoom_out')
    }
  },

  methods: {

    mode (topic) {
      return this.$store.state.isEditActive.includes(topic.id) ? 'form' : 'info'
    },

    handle (command) {
      this[command]()
    },

    // 5 methods called by dropdown menu

    newDocument () {
      // TODO: align it with note/label/textblock? Possibly current model-driven approach not needed anymore
      // as meanwhile document(name)s are auto-translated, that is single input field in create-form.
      this.$store.dispatch('newTopic', this.newDocumentViewTopic())
    },

    newNote () {
      this.$store.dispatch('newTopic', this.newViewTopic('zukunftswerk.note'))
    },

    newTextblock () {
      this.$store.dispatch('newTopic', this.newViewTopic('zukunftswerk.textblock'))
    },

    newLabel () {
      this.$store.dispatch('newTopic', this.newViewTopic('zukunftswerk.label'))
    },

    newArrow () {
      const arrow = this.newViewTopic('zukunftswerk.arrow')
      arrow.value = 'Arrow ' + newArrowId()     // the Value Integrator needs something to integrate
      this.$store.dispatch('createArrow', arrow)
    },

    //

    newDocumentViewTopic () {
      return new dmx.ViewTopic({
        ...dmx.typeCache.getTopicType('zukunftswerk.document').newFormModel(),
        id: newSynId(),   // overwrite ID created in previous line
        viewProps: this.viewProps('zukunftswerk.document')
      })
    },

    newViewTopic (typeUri) {
      return new dmx.ViewTopic({
        id: newSynId(),
        typeUri,
        value: '',        // used as intermediate note/label model while create
        viewProps: this.viewProps(typeUri)
      })
    },

    viewProps (typeUri)  {
      const x = Math.round((zw.CANVAS_BORDER - this.pan.x) / this.zoom / zw.CANVAS_GRID) * zw.CANVAS_GRID
      const y = Math.round((zw.CANVAS_BORDER - this.pan.y) / this.zoom / zw.CANVAS_GRID) * zw.CANVAS_GRID
      return {
        'dmx.topicmaps.x': x,
        'dmx.topicmaps.y': y,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false,
        'dmx.topicmaps.width': typeUri === 'zukunftswerk.arrow' ? zw.ARROW_LENGTH : zw.FORM_WIDTH,
        'zukunftswerk.angle': 0
      }
    },

    home () {
      const viewport = zw.getViewport()
      this.$store.dispatch('setViewport', {
        pan: viewport.pan,
        zoom: viewport.zoom,
        transition: true
      })
    },

    zoomToFit () {
      let xMin = 1000, xMax = -1000
      let yMin = 1000, yMax = -1000
      this.topics.forEach(topic => {
        const x1 = topic.pos.x
        const y1 = topic.pos.y
        const item = document.querySelector(`.zw-canvas-item[data-id="${topic.id}"]`)
        const x2 = x1 + item.clientWidth
        const y2 = y1 + item.clientHeight
        if (x1 < xMin) xMin = x1
        if (y1 < yMin) yMin = y1
        if (x2 > xMax) xMax = x2
        if (y2 > yMax) yMax = y2
      })
      const width = xMax - xMin
      const height = yMax - yMin
      const canvas = this.$refs.canvas
      const widthC = canvas.clientWidth - 2 * zw.CANVAS_BORDER
      const heightC = canvas.clientHeight - 2 * zw.CANVAS_BORDER
      const zoomW = widthC / width
      const zoomH = heightC / height
      const zoom = Math.min(zoomW, zoomH)
      const dx = (widthC / zoom - width) / 2
      const dy = (heightC / zoom - height) / 2
      const x = (dx - xMin) * zoom + zw.CANVAS_BORDER
      const y = (dy - yMin) * zoom + zw.CANVAS_BORDER
      this.$store.dispatch('setViewport', {pan: {x, y}, zoom, transition: true})
    },

    stepZoom (delta) {
      const c = this.$refs.canvas
      this.setZoom(this.zoom + delta, c.clientWidth / 2, c.clientHeight / 2, true)
    },

    wheelZoom (e) {
      this.setZoom(this.zoom - .003 * e.deltaY, e.clientX, e.clientY - HEADER_HEIGHT)
    },

    setZoom (zoom, cx, cy, transition) {
      zoom = Math.min(Math.max(zoom, .2), 2)
      const zoomChange = zoom - this.zoom
      const px = (cx - this.pan.x) / this.zoom * zoomChange
      const py = (cy - this.pan.y) / this.zoom * zoomChange
      this.$store.dispatch('setViewport', {
        pan: {
          x: this.pan.x - px,
          y: this.pan.y - py
        },
        zoom,
        transition
      })
    },

    deleteMany () {
      this.$store.dispatch('deleteMany', this.selection.map(topic => topic.id))
    },

    transitionend () {
      this.$store.dispatch('transitionEnd')
    },

    // "Selecto" event handling

    onDragSelectStart (e) {
      const target = e.inputEvent.target
      if (this.$refs.moveable.isMoveableElement(target) || this.targets.some(t => t === target || t.contains(target))) {
        e.stop()
      } else {
        if (e.inputEvent.target.classList.contains('zw-canvas')) {
          if (e.inputEvent.shiftKey) {
            e.inputEvent.stopPropagation()
          } else {
            e.preventDrag()
          }
        }
      }
    },

    onSelect (e) {
      this.$store.dispatch('updateSelection', {
        addTopics: e.added.map(el => el.__vue__.topic),
        removeTopicIds: e.removed.map(el => Number(el.dataset.id))
      })
      setTimeout(() => {
        this.positionGroupToolbar()
      }, 50)
    },

    onSelectEnd (e) {
      if (e.isDragStart) {
        e.inputEvent.preventDefault()
        setTimeout(() => {
          this.$refs.moveable.dragStart(e.inputEvent)
        })
      }
    },

    // "Moveable" event handling

    onDragStart (e) {
      this.dragStartPos = this.findTopic(e.target).pos
    },

    onDrag (e) {
      this.config('moveHandler')(this.findTopic(e.target), e.left, e.top)
    },

    onDragEnd (e) {
      this.$store.dispatch('storeTopicPos', this.findTopic(e.target))
    },

    onClickGroup (e) {
      this.$refs.selecto.clickTarget(e.inputEvent, e.inputTarget)
    },

    onDragGroupStart (e) {
      // remembers start positions
      const p = {}
      e.targets.forEach(el => {
        const topic = this.findTopic(el)
        p[topic.id] = topic.pos
      })
      this.dragGroupStartPos = p
    },

    onDragGroup (e) {
      e.targets.forEach(el => {
        const topic = this.findTopic(el)
        const pos = this.dragGroupStartPos[topic.id]
        this.config('moveHandler', topic)(topic, pos.x + e.left, pos.y + e.top)
        this.positionGroupToolbar()
      })
    },

    onDragGroupEnd (e) {
      const topicCoords = e.targets.map(el => {
        const topic = this.findTopic(el)
        const pos = topic.pos
        return {
          topicId: topic.id,
          x: pos.x,
          y: pos.y
        }
      })
      this.$store.dispatch('storeTopicCoords', topicCoords)
    },

    onResize (e) {
      // Note: snap-to-grid while resize is in progress did not work as expected (the mouse is no longer over the
      // component when width is changed programmatically?). Workaround is to snap only on resize-end.
      this.setWidth(e.target, e.width)
    },

    onResizeEnd ({target}) {
      // snap to grid
      const topic = this.findTopic(target)
      const width = Math.round(topic.getViewProp('dmx.topicmaps.width') / zw.CANVAS_GRID) * zw.CANVAS_GRID
      this.setWidth(target, width)
      this.$store.dispatch('storeTopicSize', topic)
    },

    onRotate ({target, rotate}) {
      const angle = Math.round(rotate / 5) * 5          // rotate in 5 deg steps
      target.style.transform = `rotate(${angle}deg)`;   // view update not strictly required but improves rendering
      this.findTopic(target).setViewProp('zukunftswerk.angle', angle)     // update model
    },

    onRotateEnd (e) {
      this.$store.dispatch('storeTopicAngle', this.findTopic(e.target))
    },

    onEnter () {
      this.groupToolbarVisibility = true
    },

    onLeave () {
      this.groupToolbarVisibility = false
    },

    moveHandler (topic, x, y) {
      topic.setPosition({                                                 // update model
        // snap to grid
        x: Math.round(x / zw.CANVAS_GRID) * zw.CANVAS_GRID,
        y: Math.round(y / zw.CANVAS_GRID) * zw.CANVAS_GRID
      })
    },

    arrowMoveHandler (topic, x, y) {
      const p = this.dragStartPos
      topic.setPosition({                                                 // update model
        // snap to grid
        x: p.x + Math.round((x - p.x) / zw.CANVAS_GRID) * zw.CANVAS_GRID,
        y: p.y + Math.round((y - p.y) / zw.CANVAS_GRID) * zw.CANVAS_GRID
      })
      const vm = document.querySelector('.zw-arrow-handles').__vue__      // update view
      if (vm.visible) {
        vm.updateHandles()
      }
    },

    setWidth (target, width) {
      // Note: for width measurement "moveable" relies on an up-to-date *view*.
      // In contrast updating the *model* (view props) updates the view asynchronously.
      this.findTopic(target).setViewProp('dmx.topicmaps.width', width)    // update model
      target.style.width = `${width}px`                                   // update view
    },

    positionGroupToolbar () {
      const selector = '.zw-canvas .content-layer .moveable-control-box'
      const moveableArea = document.querySelector(`${selector} .moveable-area`)
      if (moveableArea) {
        const controlBox = document.querySelector(selector)
        const match = controlBox.style.transform.match(/translate3d\((-?[0-9.]+)px, (-?[0-9.]+)px, 0px\)/)
        this.groupToolbarPos.x = Number(match[1])
        this.groupToolbarPos.y = Number(match[2]) + moveableArea.clientHeight
      }
    },

    findTopic (el) {
      return this.selection.find(topic => topic.id == el.dataset.id)      // Note: dataset values are strings
    },

    config (prop, topic = this.selectedTopic) {
      const c = this.CONFIG[topic.typeUri]
      const config = c && c[prop]
      return config !== undefined ? config : this.DEFAULT[prop]
    }
  },

  components: {
    'zw-canvas-item': require('./zw-canvas-item').default,
    'zw-canvas-search': require('./zw-canvas-search').default,
    'zw-arrow-handles': require('./zw-arrow-handles').default,
    'vue-selecto': require('vue-selecto').default
  }
}

function newArrowId () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}

function newSynId () {
  return synId--
}
</script>

<style>
.zw-canvas {
  position: relative;
  flex-grow: 1;
  background-image: url("../../resources-build/grid.png");
  min-width: 0;
  overflow: hidden;
}

.zw-canvas .add-menu {
  position: absolute;   /* don't consume canvas space */
}

.zw-canvas .add-menu .add-button {
  position: relative;   /* only positioned elements have a z-index; "absolute" would displace dropdown menu */
  z-index: 1;           /* place button above canvas items */
  font-size: 24px;
  margin: 8px;
}

.zw-canvas .canvas-toolbar {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 1;           /* place buttons above canvas items */
}

.zw-canvas .canvas-toolbar .el-button {
  font-size: 24px;
}

.zw-canvas .canvas-toolbar .zw-canvas-search {
  margin-left: 15px;
}

.zw-canvas .content-layer {
  width: 10000px;       /* avoid early line wrapping */
}

.zw-canvas .content-layer.transition {
  transition: transform .5s;
}

.zw-canvas .content-layer .group-toolbar {
  position: absolute;
}
</style>
