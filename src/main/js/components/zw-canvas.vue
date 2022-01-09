<template>
  <div class="zw-canvas" :style="style" @mousedown="mousedown" @mouseup="mouseup" @wheel="wheel">
    <el-dropdown v-if="isTeam" @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newDocument"><zw-string>item.document</zw-string></el-dropdown-item>
        <el-dropdown-item command="newNote"><zw-string>item.note</zw-string></el-dropdown-item>
        <el-dropdown-item command="newLabel"><zw-string>item.label</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="content-layer" :style="contentLayerStyle">
      <zw-drag-resize v-for="topic in topics"    :topic="topic" mode="info" :key="topic.id"></zw-drag-resize>
      <zw-drag-resize v-for="topic in newTopics" :topic="topic" mode="form" :key="topic.id"></zw-drag-resize>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  data () {
    return {
      dragPos: undefined      // temporary mouse pos while canvas drag
    }
  },

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

    zoom: {
      get () {
        return this.$store.state.zoom
      },
      set (zoom) {
        this.$store.dispatch('setZoom', zoom)
      }
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
             topic.typeUri === 'zukunftswerk.label'
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

    newDocumentViewTopic () {
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
        viewProps: this.viewProps()
      })
    },

    newViewTopic (typeUri) {
      return new dmx.ViewTopic({
        typeUri,
        value: '',      // used as intermediate model while create
        viewProps: this.viewProps()
      })
    },

    viewProps ()  {
      return {
        'dmx.topicmaps.x': (80 - this.pan.x) / this.zoom,
        'dmx.topicmaps.y': (80 - this.pan.y) / this.zoom,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false
      }
    },

    mousedown (e) {
      this.$el.addEventListener('mousemove', this.mousemove)
      this.dragPos = {
        x: e.clientX,
        y: e.clientY
      }
      this.$emit('panStart')
    },

    mousemove (e) {
      this.pan.x += e.clientX - this.dragPos.x    // TODO: dispatch action
      this.pan.y += e.clientY - this.dragPos.y    // TODO: dispatch action
      this.dragPos.x = e.clientX
      this.dragPos.y = e.clientY
    },

    mouseup () {
      this.$el.removeEventListener('mousemove', this.mousemove)
      this.$emit('panStop')
      // TODO: update sever state?
    },

    wheel (e) {
      this.zoom -= .003 * e.deltaY
      this.zoom = Math.min(Math.max(.5, this.zoom), 2)
    }
  },

  components: {
    'zw-drag-resize': require('./zw-drag-resize').default
  }
}
</script>

<style>
.zw-canvas {
  flex-grow: 1;
  background-image: url("../../resources/grid.png");
}

.zw-canvas .add-button {
  margin: 8px;
  font-size: 24px;
}

.zw-canvas .content-layer {
  width: 10000px;    /* avoid early line wrapping */
}
</style>
