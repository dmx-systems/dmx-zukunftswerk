<template>
  <div v-if="infoMode" class="zw-note dmx-html-field info" v-html="html" :style="style"></div>
  <div v-else class="zw-note dmx-html-field form" :style="style">
    <quill v-model="text.value" :options="quillOptions"></quill>
    <el-button type="primary" @click="save">Save</el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    topic: dmx.ViewTopic,     // the Note topic (dmx.ViewTopic)
    mode: {                   // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  computed: {

    text () {
      return this.topic.children['dmx.notes.text']
    },

    html () {
      return this.text && this.text.value
    },

    style () {
      const pos = this.topic.getPosition()
      return {
        top:  `${pos.y}px`,
        left: `${pos.x}px`,
      }
    },

    infoMode () {
      return this.mode === 'info'
    },

    quillOptions () {
      return this.$store.state.quillOptions
    }
  },

  methods: {
    save () {
      this.$store.dispatch('createTopic', this.topic)
    }
  },

  components: {
    quill: () => ({
      component: import('vue-quill-minimum' /* webpackChunkName: "vue-quill-minimum" */),
      loading: require('./zw-spinner')
    })
  }
}
</script>

<style>
.zw-note {
  position: absolute;
  min-width: 120px;
  max-width: 420px;
  padding: 8px;
  background-color: rgb(255, 250, 109);
}
</style>
