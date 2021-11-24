<template>
  <div class="zw-canvas" @mousedown="mousedown" @mouseup="mouseup">
    <el-dropdown @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newNote"><zw-string>new.note</zw-string></el-dropdown-item>
        <el-dropdown-item><zw-string>new.label</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="items" :style="style">
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
      pan: {x: 0, y: 0},      // canvas pan
      dragPos: undefined     // mouse position on canvas drag start
    }
  },

  computed: {

    topicmap () {
      return this.$store.state.topicmap
    },

    topics () {
      return this.topicmap ? this.topicmap.topics.filter(this.canvasFilter) : []
    },

    newTopics () {
      return this.$store.state.newTopics
    },

    style () {
      return {
        'transform': `translate(${this.pan.x}px, ${this.pan.y}px)`
      }
    }
  },

  methods: {

    canvasFilter (topic) {
      return topic.typeUri === 'zukunftswerk.document' ||
             topic.typeUri === 'zukunftswerk.note'
    },

    handle (command) {
      this[command]()
    },

    newNote () {
      this.$store.dispatch('newTopic', new dmx.ViewTopic({
        typeUri: 'dmx.notes.note',
        children: {
          'dmx.notes.text': {
            value: ''
          }
        },
        viewProps: {
          'dmx.topicmaps.x': 100,
          'dmx.topicmaps.y': 100,
          'dmx.topicmaps.visibility': true,
          'dmx.topicmaps.pinned': false
        }
      }))
    },

    mousedown (e) {
      this.$el.addEventListener('mousemove', this.mousemove)
      this.dragPos = {
        x: e.clientX,
        y: e.clientY
      }
    },

    mousemove (e) {
      this.pan.x += e.clientX - this.dragPos.x
      this.pan.y += e.clientY - this.dragPos.y
      this.dragPos.x = e.clientX
      this.dragPos.y = e.clientY
    },

    mouseup () {
      this.$el.removeEventListener('mousemove', this.mousemove)
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
  padding: 0;
  margin: 8px;
  font-size: 24px;
}

.zw-canvas .items {
  height: 100%;
}
</style>
