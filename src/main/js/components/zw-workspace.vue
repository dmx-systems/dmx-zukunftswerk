<template>
  <div class="zw-workspace">
    <el-dropdown @command="handle">
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newNote"><zw-string>add.note</zw-string></el-dropdown-item>
        <el-dropdown-item><zw-string>add.document</zw-string></el-dropdown-item>
        <el-dropdown-item><zw-string>add.textfield</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <component v-for="topic in topics" :is="topic.typeUri" :key="topic.id" :topic="topic"></component>
    <component v-for="topic in newTopics" :is="topic.typeUri" :key="topic.id" :topic="topic" mode="form"></component>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  computed: {

    topicmap () {
      return this.$store.state.topicmap
    },

    topics () {
      return this.topicmap ? this.topicmap.topics.filter(this.canvasFilter) : []
    },

    newTopics () {
      return this.$store.state.newTopics
    }
  },

  methods: {

    canvasFilter (topic) {
      return topic.typeUri === 'dmx.notes.note'
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
    }
  },

  components: {
    'dmx.notes.note': require('./zw-note').default
  }
}
</script>

<style>
.zw-workspace {
  flex-grow: 1;
  background-image: url("../../resources/grid.png");
}

.zw-workspace .add-button {
  padding: 0;
  margin: 8px;
  font-size: 24px;
}
</style>
