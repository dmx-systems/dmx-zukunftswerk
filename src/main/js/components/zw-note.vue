<template>
  <div v-if="infoMode" class="zw-note" v-html="html" :style="style"></div>
  <div v-else class="zw-note" :style="style">
    <quill v-model="topic.children['dmx.notes.text'].value" :options="quillOptions"></quill>
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

/* Quill Overrides */

.ql-container {
  font-family: var(--main-font-family) !important;    /* Quill default is "Helvetica, Arial, sans-serif" */
  font-size:   var(--main-font-size)   !important;    /* Quill default is 13px */
}

.ql-container .ql-editor {
  line-height: inherit !important;                    /* Quill default is 1.42; inherit from dmx-html-field */
  padding: 6px 8px !important;                        /* Quill default is 12px 15px */
  background-color: white;
}

.ql-container .ql-editor h1 {
  margin-top: 0.67em;                                 /* Restore user agent style; Quill default is 0 */
  margin-bottom: 0.67em;                              /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor h2 {
  margin-top: 0.83em;                                 /* Restore user agent style; Quill default is 0 */
  margin-bottom: 0.83em;                              /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor h3 {
  margin-top: 1em;                                    /* Restore user agent style; Quill default is 0 */
  margin-bottom: 1em;                                 /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-editor ol,
.ql-container .ql-editor ul {
  margin-top: 1em;                                    /* Restore user agent style; Quill default is 0 */
  margin-bottom: 1em;                                 /* Restore user agent style; Quill default is 0 */
}

.ql-container .ql-tooltip {
  width: 250px;         /* fixed toolbar width */
  z-index: 2;           /* stack toolbar above adjacent detail panel fields and el-checkboxes (z-index 1) */
}

.ql-container .ql-tooltip .ql-toolbar .ql-formats:nth-child(4) {
  margin-left: 12px;    /* margin for 2nd toolbar row */
}
</style>
