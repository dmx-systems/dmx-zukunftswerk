<template>
  <div class="zw-workspace">
    <el-dropdown>
      <el-button class="add-button" type="text" icon="el-icon-circle-plus"></el-button>
      <el-dropdown-menu>
        <el-dropdown-item><zw-string>add.note</zw-string></el-dropdown-item>
        <el-dropdown-item><zw-string>add.document</zw-string></el-dropdown-item>
        <el-dropdown-item><zw-string>add.textfield</zw-string></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <component v-for="topic in topics" :is="topic.typeUri" :key="topic.id" :topic="topic"></component>
  </div>
</template>

<script>
export default {

  computed: {

    topicmap () {
      return this.$store.state.topicmap
    },

    topics () {
      return this.topicmap ? this.topicmap.topics.filter(this.canvasFilter) : []
    }
  },

  methods: {
    canvasFilter (topic) {
      return topic.typeUri === 'dmx.notes.note'
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
