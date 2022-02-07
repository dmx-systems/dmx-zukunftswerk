<template>
  <div class="zw-canvas" :style="style" @click="click" @wheel="wheel">
    <el-dropdown v-if="isTeam" trigger="click" @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newDocument"><zw-string>item.document</zw-string></el-dropdown-item>
        <el-dropdown-item command="newNote"><zw-string>item.note</zw-string></el-dropdown-item>
        <el-dropdown-item command="newLabel" divided><zw-string>item.label</zw-string></el-dropdown-item>
        <el-dropdown-item command="newArrow"><zw-string>item.arrow</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="content-layer" :style="contentLayerStyle">
      <zw-canvas-item v-for="topic in topics"    :topic="topic" :mode="mode(topic)" :key="topic.id"></zw-canvas-item>
      <zw-canvas-item v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-canvas-item>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  computed: {

    isTeam () {
      return this.$store.state.isTeam
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
      return this.topicmap ? this.topicmap.topics.filter(this.canvasFilter) : []
    },

    newTopics () {
      return this.$store.state.newTopics
    },

    style () {
      return {
        'background-position': `${this.bgPos.x}px ${this.bgPos.y}px`
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
        x: this.pan.x % 20,     // 20x20 = size of grid.png
        y: this.pan.y % 20
      }
    }
  },

  methods: {

    canvasFilter (topic) {
      return topic.typeUri === 'zukunftswerk.document' ||
             topic.typeUri === 'zukunftswerk.note'     ||
             topic.typeUri === 'zukunftswerk.label'    ||
             topic.typeUri === 'zukunftswerk.arrow'
    },

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
      // TODO: use newFormModel()
      return new dmx.ViewTopic({
        typeUri: 'zukunftswerk.document',
        children: {
          'zukunftswerk.document_name.de': {
            value: ''
          },
          'zukunftswerk.document_name.fr': {
            value: ''
          },
          'dmx.files.file#zukunftswerk.de': {
            children: {
              'dmx.files.path': {
                value: ''
              }
            }
          },
          'dmx.files.file#zukunftswerk.fr': {
            children: {
              'dmx.files.path': {
                value: ''
              }
            }
          }
        },
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
      return {
        'dmx.topicmaps.x': (40 - this.pan.x) / this.zoom,     // 40 matches store.js revealDocuments()
        'dmx.topicmaps.y':     - this.pan.y  / this.zoom,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false,
        'dmx.topicmaps.width': typeUri === 'zukunftswerk.arrow' ? 200 : 384
        // 360=width of upload area, +24=2*12 pixel padding   // TODO: proper geometry
      }
    },

    click () {
      this.$store.dispatch('setTopic', undefined)             // reset topic selection
    },

    wheel (e) {
      const zoom = Math.min(Math.max(this.zoom - .003 * e.deltaY, .2), 2)
      this.$store.dispatch('setZoom', zoom)
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
  background-image: url("../../resources/grid.png");
}

.zw-canvas .add-button {
  position: relative;   /* only positioned elements have a z-index; "absolute" would displace dropdown menu */
  z-index: 1;           /* place button above canvas items */
  font-size: 24px;
  margin: 8px;
}

.zw-canvas .content-layer {
  width: 10000px;       /* avoid early line wrapping */
}
</style>
