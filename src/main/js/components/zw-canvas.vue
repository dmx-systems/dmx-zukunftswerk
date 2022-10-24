<template>
  <div class="zw-canvas" :style="style" ref="canvas" @wheel="wheelZoom">
    <el-dropdown v-if="isTeam || isEditor" trigger="click" @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newDocument"><zw-string>item.document</zw-string></el-dropdown-item>
        <el-dropdown-item command="newNote"><zw-string>item.note</zw-string></el-dropdown-item>
        <el-dropdown-item command="newLabel" divided><zw-string>item.label</zw-string></el-dropdown-item>
        <el-dropdown-item command="newArrow"><zw-string>item.arrow</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="button-panel">
      <el-button type="text" icon="el-icon-s-home" @click="home"></el-button>
      <el-button type="text" icon="el-icon-full-screen" @click="zoomToFit"></el-button>
      <el-button type="text" icon="el-icon-zoom-in" @click="stepZoom(.1)"></el-button>
      <el-button type="text" icon="el-icon-zoom-out" @click="stepZoom(-.1)"></el-button>
      <el-button type="text" icon="el-icon-c-scale-to-original" @click="resetZoom"></el-button>
      <zw-canvas-search></zw-canvas-search>
    </div>
    <div class="content-layer" :style="zoomStyle">
      <zw-canvas-item v-for="topic in topics" :topic="topic" :mode="mode(topic)" :key="topic.id"></zw-canvas-item>
      <zw-canvas-item v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-canvas-item>
    </div>
    <zw-arrow-handles></zw-arrow-handles>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'

let HEADER_HEIGHT
let synId = -1          // gernerator for temporary synthetic topic IDs, needed for topics not yet saved, counts down

export default {

  mixins: [
    require('./mixins/zoom').default,
    require('./mixins/selection').default
  ],

  mounted () {
    HEADER_HEIGHT = document.querySelector('.zw-header').clientHeight
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

    isTeam () {
      return this.$store.state.isTeam
    },

    isEditor () {
      return this.$store.state.isEditor
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    topics () {
      return this.topicmap?.topics.filter(zw.canvasFilter) || []
    },

    newTopics () {
      return this.$store.state.newTopics
    },

    lang () {
      return this.$store.state.lang
    }
  },

  watch: {
    lang () {
      if (this.selectedTopic) {
          // FIXME: proper synchronization with pfd/images loading (documents)
          this.$store.dispatch('updateControlBox', {topicId: this.selectedTopic.id, delay: 300})
      }
    }
  },

  methods: {

    mode (topic) {
      return this.$store.state.isEditActive.includes(topic.id) ? 'form' : 'info'
    },

    handle (command) {
      this[command]()
    },

    newDocument () {
      this.$store.dispatch('newTopic', this.newDocumentViewTopic())
    },

    newNote () {
      this.$store.dispatch('newTopic', this.newViewTopic('zukunftswerk.note'))
    },

    newLabel () {
      this.$store.dispatch('newTopic', this.newViewTopic('zukunftswerk.label'))
    },

    newArrow () {
      const arrow = this.newViewTopic('zukunftswerk.arrow')
      arrow.value = 'Arrow ' + newArrowId()     // the Value Integrator needs something to integrate
      this.$store.dispatch('createArrow', arrow)
    },

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
        zoom: viewport.zoom
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
      this.$store.dispatch('setViewport', {pan: {x, y}, zoom})
    },

    resetZoom () {
      const c = this.$refs.canvas
      this.setZoom(1, c.clientWidth / 2, c.clientHeight / 2)
    },

    stepZoom (delta) {
      const c = this.$refs.canvas
      this.setZoom(this.zoom + delta, c.clientWidth / 2, c.clientHeight / 2)
    },

    wheelZoom (e) {
      this.setZoom(this.zoom - .003 * e.deltaY, e.clientX, e.clientY - HEADER_HEIGHT)
    },

    setZoom (zoom, cx, cy) {
      zoom = Math.min(Math.max(zoom, .2), 2)
      const zoomChange = zoom - this.zoom
      const px = (cx - this.pan.x) / this.zoom * zoomChange
      const py = (cy - this.pan.y) / this.zoom * zoomChange
      this.$store.dispatch('setViewport', {pan: {x: this.pan.x - px, y: this.pan.y - py}, zoom})
    }
  },

  components: {
    'zw-canvas-item': require('./zw-canvas-item').default,
    'zw-canvas-search': require('./zw-canvas-search').default,
    'zw-arrow-handles': require('./zw-arrow-handles').default
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
</style>
