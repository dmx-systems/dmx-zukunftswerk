<template>
  <div v-if="infoMode" class="zw-note" v-html="html" :style="style"></div>
  <div v-else class="zw-note" :style="style">
    <textarea v-model="topic.children['dmx.notes.text'].value" rows="8" cols="30"></textarea><br>
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

    html () {
      const text = this.topic.children['dmx.notes.text']
      return text && text.value
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
    }
  },

  methods: {
    save () {
      this.$store.dispatch('createTopic', this.topic)
    }
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
