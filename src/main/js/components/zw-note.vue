<template>
  <div v-if="infoMode" class="zw-note dmx-html-field info" v-html="noteHtml"></div>
  <div v-else class="zw-note dmx-html-field form" v-loading="saving">
    <div class="field-label">
      <zw-string>label.new_note</zw-string>
    </div>
    <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>button.submit</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  data () {
    return {
      saving: false           // true while note is saved
    }
  },

  props: {
    topic: {                  // the Note topic (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },
    mode: {                   // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  computed: {

    de () {
      return this.html('de')
    },

    fr () {
      return this.html('fr')
    },

    lang () {
      return this.$store.state.lang
    },

    noteLang () {
      if (this.de && this.fr) {
        return this.lang
      } else if (this.de) {
        return 'de'
      } else if (this.fr) {
        return 'fr'
      }
    },

    noteHtml () {
      if (this.noteLang) {
        const html = this.topic.children['zukunftswerk.note.' + this.noteLang]
        // console.log(html && html.value)
        return html && html.value
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

    html (lang) {
      const html = this.topic.children['zukunftswerk.note.' + lang].value
      if (html !== '<p><br></p>') {
        return html
      }
    },

    focus () {
      this.$refs.quill.focus()
    },

    save () {
      this.saving = true
      this.$store.dispatch('createNote', this.topic).then(() => {
        this.saving = false
      })
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
  padding: 10px;
  background-color: rgb(255, 250, 109);
}

.zw-note.form {
  min-width: 240px;
}

.zw-note .save-button {
  margin-top: 6px;
}
</style>
