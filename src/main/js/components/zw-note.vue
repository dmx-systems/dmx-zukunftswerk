<template>
  <div class="zw-note dmx-html-field info" v-if="infoMode" v-html="noteHtml" :style="{'background-color': color}"></div>
  <div :class="['zw-note', 'dmx-html-field', 'form']" v-else v-loading="saving">
    <template v-if="isNew">
      <div class="field">
        <div class="field-label"><zw-string>label.new_note</zw-string></div>
        <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
      </div>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label"><zw-string>item.note</zw-string> ({{lang1}})</div>
        <quill v-model="model[lang1].value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
      </div>
      <div class="translate">
        <el-button type="text" icon="el-icon-bottom" :title="translateTooltip" @click="doTranslate"></el-button>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>item.note</zw-string> ({{lang2}})</div>
        <quill v-model="model[lang2].value" :options="quillOptions" ref="translation" v-loading="translating"></quill>
        <div :class="['edited-indicator', {edited: editedFlag}]"><zw-string>label.translation_edited</zw-string></div>
      </div>
    </template>
    <zw-color-selector v-model="selectedColor"></zw-color-selector>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>action.submit</zw-string>
    </el-button>
    <el-button size="medium" @click="doCancel">
      <zw-string>action.cancel</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'
import errorHandler from '../error-handler'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/translation').default,
    require('./mixins/highlight').default,
    require('./mixins/color-selector').default
  ],

  updated () {
    this.$store.dispatch('updateControlBox', this.topic.id)
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

  data () {
    return {
      type: 'zukunftswerk.note',
      saving: false                   // true while note is saved
    }
  },

  computed: {

    note () {
      return {
        de: this.html('de'),
        fr: this.html('fr')
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
      return this.highlight(this.topic, this.note[this.noteLang], true)
    },

    // TODO: factor out as a mixin? Copies in zw-label.vue, zw-document.vue, zw-textblock.vue
    isNew () {
      return this.topic.id < 0
    },

    lang () {
      return this.$store.state.lang
    },

    quillOptions () {
      return zw.quillOptions
    }
  },

  methods: {

    focus () {
      this.$refs.quill.focus()
    },

    save () {
      this.saving = true
      this.topic.setViewProp('zukunftswerk.color', this.selectedColor)            // persistence
      this.topic.children['zukunftswerk.color'] = {value: this.selectedColor}     // view
      let action, arg, msgBox
      if (this.isNew) {
        action = 'createNote'
        arg = {topic: this.topic}
        msgBox = 'confirm'
      } else {
        action = 'updateAndStoreColor'
        arg = this.topic
        // transfer edit buffer to topic model
        this.topic.children['zukunftswerk.translation_edited'] = {value: this.editedFlag}
        this.setNote('de')
        this.setNote('fr')
      }
      this.$store.dispatch(action, arg).catch(error => {
        return this.handleError(error, msgBox)
      }).then(result => {
        if (result === 'confirm') {
          arg.monolingual = true
          this.$store.dispatch(action, arg).catch(error => {
            errorHandler(error)     // generic error handler
          })
        }
      }).catch(result => {
        // console.log('cancel', result)
      }).finally(() => {
        this.saving = false
      })
    },

    doTranslate () {
      this.translate().then(translation => {
        // Note: in case of translation error 'confirm' is passed (String)
        // TODO: why is this needed here, but not in zw-label.vue or zw-document.vue?
        if (translation instanceof Object) {
          this.$refs.translation.setHTML(translation.text) // TODO: atm vue-quill-minimum does not react on model change
        }
      })
    },

    html (lang) {
      // Note: in a monolingual note "fr" is not defined
      const html = this.topic.children['zukunftswerk.note.' + lang]?.value
      if (html !== '<p><br></p>') {
        return html
      }
    },

    setNote (lang) {
      // Note: in a monolingual note "fr" is not defined     // TODO: simplify
      if (!this.topic.children['zukunftswerk.note.fr']) {
        this.$set(this.topic.children, 'zukunftswerk.note.fr', {})
      }
      //
      const compDefUri = 'zukunftswerk.note.' + lang
      this.topic.children[compDefUri].value = this.model[lang].value
    }
  },

  components: {
    'zw-color-selector': require('./zw-color-selector').default,
    quill: () => ({
      component: import('vue-quill-minimum' /* webpackChunkName: "vue-quill-minimum" */),
      loading: require('./zw-spinner')
    })
  }
}
</script>

<style>
.zw-note {
  padding: 12px;
}

.zw-note.form {
  background-color: var(--background-color);
}

.zw-note.form .translate {
  text-align: center;
  margin-top: 12px;
}

.zw-note.form .translate .el-button {
  font-size: 24px;
}

.zw-note.form .save-button {
  margin-top: var(--field-spacing);
}
</style>
