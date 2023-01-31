<template>
  <div class="zw-canvas" :style="style" ref="canvas" @wheel="wheelZoom">
    <!-- Create menu -->
    <el-dropdown v-if="editable" trigger="click" @command="handle">
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
    <div class="button-panel">
      <el-button type="text" icon="el-icon-s-home" :title="homeTooltip" @click="home"></el-button>
      <el-button type="text" icon="el-icon-full-screen" :title="fullscreenTooltip" @click="zoomToFit"></el-button>
      <el-button type="text" icon="el-icon-zoom-in" :title="zoomInTooltip" @click="stepZoom(.1)"></el-button>
      <el-button type="text" icon="el-icon-zoom-out" :title="zoomOutTooltip" @click="stepZoom(-.1)"></el-button>
      <zw-canvas-search></zw-canvas-search>
    </div>
    <!-- Content layer -->
    <div :class="['content-layer', {transition}]" :style="zoomStyle" @transitionend="transitionend">
      <zw-canvas-item v-for="topic in topics" :topic="topic" :mode="mode(topic)" :key="topic.id"></zw-canvas-item>
      <zw-canvas-item v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-canvas-item>
      <vue-moveable ref="moveable" :target="targets" :draggable="draggable" :resizable="resizable"
        :rotatable="rotatable" :origin="false" :renderDirections="['e']" @clickGroup="onClickGroup"
        @dragGroup="onDragGroup" @dragStart="onDragStart" @drag="onDrag" @dragEnd="onDragEnd" @resize="onResize"
        @resizeEnd="onResizeEnd" @rotate="onRotate" @rotateEnd="onRotateEnd">
      </vue-moveable>
    </div>
    <vue-selecto ref="selecto" :selectable-targets="['.content-layer .zw-canvas-item']" :selectFromInside="false"
      toggle-continue-select="shift" @dragStart="onDragSelectStart" @select="onSelect" @selectEnd="onSelectEnd">
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
    require('./mixins/zoom').default,
    require('./mixins/selection').default,
    require('./mixins/editable').default
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
      dragStartPos: undefined   // TODO: needed? Operate on event "delta" instead?
    }
  },

  computed: {

    style () {
      return {
        'background-position': `${this.bgPos.x}px ${this.bgPos.y}px`,
        'background-size': `${zw.CANVAS_GRID * this.zoom}px`
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
      return this.config('resizeStyle')
    },

    rotateEnabled () {
      return this.config('rotateEnabled')
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

    transitionend () {
      this.$store.dispatch('transitionEnd')
    },

    // "selecto" event handling

    // TODO: not needed if "selectFromInside"=false?
    onDragSelectStart (e) {
      const target = e.inputEvent.target
      console.log('onDragSelectStart', target.tagName, target.classList, this.$refs.moveable.isMoveableElement(target),
        this.targets.some(t => t === target), this.targets.some(t => t.contains(target)))
      if (this.$refs.moveable.isMoveableElement(target) || this.targets.some(t => t === target || t.contains(target))) {
        console.log('stop')
        e.stop()
      }
    },

    onSelect (e) {
      console.log('onSelect added', e.added.map(el => el.dataset.id), 'removed', e.removed.map(el => el.dataset.id))
      this.$store.dispatch('updateSelection', {
        addTopics: e.added.map(el => el.__vue__.topic),
        removeTopicIds: e.removed.map(el => Number(el.dataset.id))
      })
    },

    onSelectEnd (e) {
      console.log('onSelectEnd', e.isDragStart)
      if (e.isDragStart) {
        e.inputEvent.preventDefault()
        setTimeout(() => {
          this.$refs.moveable.dragStart(e.inputEvent)
        })
      }
    },

    // "moveable" event handling

    onDragStart ({target}) {
      this.dragStartPos = this.findTopic(target).pos
    },

    onDrag ({target, left, top}) {
      // console.log('onDrag', target)
      this.config('moveHandler')(target, left, top)
    },

    onDragEnd ({target}) {
      // console.log('onDragEnd')
      this.storePos(this.findTopic(target))
    },

    onClickGroup (e) {
      console.log('onClickGroup')
      this.$refs.selecto.clickTarget(e.inputEvent, e.inputTarget)
    },

    onDragGroup ({events}) {
      console.log('onDragGroup')
      events.forEach(e => {
        this.config('moveHandler')(e.target, e.left, e.top)       // TODO
      })
    },

    onResize ({target, width}) {
      // console.log('onResize', width)
      // Note: snap-to-grid while resize is in progress did not work as expected (the mouse is no longer over the
      // component when width is changed programmatically?). Workaround is to snap only on resize-end.
      this.setWidth(target, width)
    },

    onResizeEnd ({target}) {
      // console.log('onResizeEnd')
      // snap to grid
      const topic = this.findTopic(target)
      const width = Math.round(topic.getViewProp('dmx.topicmaps.width') / zw.CANVAS_GRID) * zw.CANVAS_GRID
      this.setWidth(target, width)
      this.storeSize(topic)
    },

    onRotate ({target, rotate}) {
      const angle = Math.round(rotate / 5) * 5          // rotate in 5 deg steps
      target.style.transform = `rotate(${angle}deg)`;   // view update not strictly required but improves rendering
      this.findTopic(target).setViewProp('zukunftswerk.angle', angle)     // update model
    },

    onRotateEnd ({target}) {
      // console.log('onRotateEnd')
      this.storeAngle(this.findTopic(target))
    },

    moveHandler (target, x, y) {
      // update client state
      this.findTopic(target).setPosition({
        x: Math.round(x / zw.CANVAS_GRID) * zw.CANVAS_GRID,     // snap to grid
        y: Math.round(y / zw.CANVAS_GRID) * zw.CANVAS_GRID
      })
    },

    arrowMoveHandler (target, x, y) {
      // snap to grid
      const p = this.dragStartPos
      this.findTopic(target).setPosition({                                    // update model
        x: p.x + Math.round((x - p.x) / zw.CANVAS_GRID) * zw.CANVAS_GRID,
        y: p.y + Math.round((y - p.y) / zw.CANVAS_GRID) * zw.CANVAS_GRID
      })
      document.querySelector('.zw-arrow-handles').__vue__.updateHandles()     // update view
    },

    setWidth (target, width) {
      // Note: for width measurement "moveable" relies on an up-to-date *view*.
      // In contrast updating the *model* (view props) updates the view asynchronously.
      target.style.width = `${width}px`                                   // update view
      this.findTopic(target).setViewProp('dmx.topicmaps.width', width)    // update model
    },

    storePos (topic) {
      this.$store.dispatch('storeTopicPos', topic)
    },

    storeSize (topic) {
      this.$store.dispatch('storeTopicSize', topic)
    },

    storeAngle (topic) {
      this.$store.dispatch('storeTopicAngle', topic)
    },

    findTopic (target) {
      return this.selection.find(topic => topic.id == target.dataset.id)    // Note: dataset values are strings
    },

    config (prop) {
      const c = this.CONFIG[this.selectedTopic?.typeUri]
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

.zw-canvas > .el-dropdown {
  position: absolute;   /* don't consume canvas space */
}

.zw-canvas > .el-dropdown .add-button {
  position: relative;   /* only positioned elements have a z-index; "absolute" would displace dropdown menu */
  z-index: 1;           /* place button above canvas items */
  font-size: 24px;
  margin: 8px;
}

.zw-canvas > .button-panel {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 1;           /* place zoom buttons above canvas items */
}

.zw-canvas > .button-panel .el-button {
  font-size: 24px;
}

.zw-canvas > .button-panel .zw-canvas-search {
  margin-left: 15px;
}

.zw-canvas .content-layer {
  width: 10000px;       /* avoid early line wrapping */
}

.zw-canvas .content-layer.transition {
  transition: transform .5s;
}
</style>
