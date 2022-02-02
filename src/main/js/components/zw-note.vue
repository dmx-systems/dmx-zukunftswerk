<template>
  <div class="zw-note dmx-html-field info" v-if="infoMode" v-html="noteHtml"></div>
  <div class="zw-note dmx-html-field form" v-else v-loading="saving">
    <template v-if="isNew">
      <div class="field-label">
        <zw-string>label.new_note</zw-string>
      </div>
      <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label">
          <zw-string>item.note</zw-string> ({{origLang}})
        </div>
        <quill v-model="noteModel[origLang]" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
      </div>
      <div class="field">
        <div class="field-label">
          <zw-string>item.note</zw-string> ({{translatedLang}})
        </div>
        <quill v-model="noteModel[translatedLang]" :options="quillOptions"></quill>
      </div>
    </template>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>button.submit</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mixins: [
    require('./mixins/orig-lang').default,
  ],

  data () {
    return {
      saving: false                   // true while note is saved
    }
  },

  props: {

    topic: {                          // the Note topic to render (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },

    topicBuffer: dmx.ViewTopic,       // the edit buffer (dmx.ViewTopic)

    mode: {                           // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  computed: {

    note () {
      return {
        de: this.html('de'),
        fr: this.html('fr')
      }
    },

    noteModel () {
      return {
        de: this.topicBuffer.children['zukunftswerk.note.de'].value,
        fr: this.topicBuffer.children['zukunftswerk.note.fr'].value
      }
    },

    noteLang () {
      if (this.note.de && this.note.fr) {
        return this.lang
      } else if (this.note.de) {
        return 'de'
      } else if (this.note.fr) {
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

    isNew () {
      return !this.topic.id
    },

    lang () {
      return this.$store.state.lang
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
      this.saving = true
      let p
      if (this.isNew) {
        p = this.$store.dispatch('createNote', this.topic)
      } else {
        // transfer edit buffer to topic model
        this.setHtml('de')
        this.setHtml('fr')
        //
        p = this.$store.dispatch('update', this.topic)
      }
      p.then(() => {
        this.saving = false
      })
    },

    html (lang) {
      const html = this.topic.children['zukunftswerk.note.' + lang].value
      if (html !== '<p><br></p>') {
        return html
      }
    },

    setHtml (lang) {
      const compDefUri = 'zukunftswerk.note.' + lang
      this.topic.children[compDefUri].value = this.noteModel[lang]
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
  margin-top: var(--field-spacing);
}
</style>
