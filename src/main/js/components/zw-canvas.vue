<template>
  <div class="zw-canvas" :style="style" @wheel="wheel">
    <el-dropdown v-if="isTeam || isEditor" trigger="click" @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newDocument"><zw-string>item.document</zw-string></el-dropdown-item>
        <el-dropdown-item command="newNote"><zw-string>item.note</zw-string></el-dropdown-item>
        <el-dropdown-item command="newLabel" divided><zw-string>item.label</zw-string></el-dropdown-item>
        <el-dropdown-item command="newArrow"><zw-string>item.arrow</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="content-layer" :style="contentLayerStyle">
      <zw-canvas-item v-for="topic in topics" :topic="topic" :mode="mode(topic)" :key="topic.id"></zw-canvas-item>
      <zw-canvas-item v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-canvas-item>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'

let HEADER_HEIGHT
const GRID_SIZE = 20    // 20x20 = size of grid.png

export default {

  mounted () {
    HEADER_HEIGHT = document.querySelector('.zw-header').clientHeight
  },

  computed: {

    isTeam () {
      return this.$store.state.isTeam
    },

    isEditor () {
      return this.$store.state.isEditor
    },

    topicmap () {
      return this.$store.state.topicmap
    },

    pan () {
      return this.$store.state.pan
    },

    zoom () {
      return this.$store.state.zoom
    },

    topics () {
      return this.topicmap ? this.topicmap.topics.filter(zw.canvasFilter) : []
    },

    newTopics () {
      return this.$store.state.newTopics
    },

    style () {
      return {
        'background-position': `${this.bgPos.x}px ${this.bgPos.y}px`,
        'background-size': `${GRID_SIZE * this.zoom}px`
      }
    },

    contentLayerStyle () {
      return {
        'transform': `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`,
        'transform-origin': 'top left'
      }
    },

    bgPos () {
      return  {
        x: this.pan.x % (GRID_SIZE * this.zoom),
        y: this.pan.y % (GRID_SIZE * this.zoom)
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
        viewProps: this.viewProps('zukunftswerk.document')
      })
    },

    newViewTopic (typeUri) {
      return new dmx.ViewTopic({
        typeUri,
        value: '',      // used as intermediate note/label model while create
        viewProps: this.viewProps(typeUri)
      })
    },

    viewProps (typeUri)  {
      const x = (zw.NEW_POS_X - this.pan.x) / this.zoom
      const y = (zw.NEW_POS_Y - this.pan.y) / this.zoom
      return {
        'dmx.topicmaps.x': x,
        'dmx.topicmaps.y': y,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false,
        ...typeUri === 'zukunftswerk.arrow' ? {
          'zukunftswerk.x1': 0,
          'zukunftswerk.y1': 0,
          'zukunftswerk.x2': 200,
          'zukunftswerk.y2': 0
        } : {
          'dmx.topicmaps.width': zw.FORM_WIDTH
        }
      }
    },

    wheel (e) {
      const zoom = Math.min(Math.max(this.zoom - .003 * e.deltaY, .2), 2)
      const zoomChange = zoom - this.zoom
      const px = (e.clientX - this.pan.x) / this.zoom * zoomChange
      const py = (e.clientY - this.pan.y - HEADER_HEIGHT) / this.zoom * zoomChange
      this.$store.dispatch('setViewport', {pan: {x: this.pan.x - px, y: this.pan.y - py}, zoom})
    }
  },

  components: {
    'zw-canvas-item': require('./zw-canvas-item').default
  }
}

function newArrowId () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}
</script>

<style>
.zw-canvas {
  flex-grow: 1;
  background-image: url("../../resources-build/grid.png");
  min-width: 0;
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

.zw-canvas .content-layer {
  width: 10000px;       /* avoid early line wrapping */
}
</style>
