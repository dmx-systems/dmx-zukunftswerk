<template>
  <div v-if="infoMode" class="zw-note dmx-html-field info" v-html="html"></div>
  <div v-else class="zw-note dmx-html-field form">
    <quill v-model="text.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
    <el-button type="primary" @click="save">Save</el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    topic: {
      type: dmx.ViewTopic,    // the Note topic (dmx.ViewTopic)
      required: true
    },
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

    infoMode () {
      return this.mode === 'info'
    },

    quillOptions () {
      return this.$store.state.quillOptions
    }
  },

  methods: {

    focus () {
      this.$refs.quill.focus()
    },

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
  min-width: 120px;
  max-width: 420px;
  padding: 8px;
  background-color: rgb(255, 250, 109);
}

.zw-note.form {
  min-width: 240px;
}
</style>
