<template>
  <div class="zw-workspace">
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
</style>
