<template>
  <div :class="['zw-textblock', 'dmx-html-field', mode]" v-loading="saving">
    <template v-if="infoMode">
      <div v-html="textblock[lang1]"></div>
      <div v-html="textblock[lang2]"></div>
    </template>
    <template v-else>
      <template v-if="isNew">
        <div class="field">
          <div class="field-label"><zw-string>label.new_textblock</zw-string></div>
          <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
      </template>
      <template v-else>
        <div class="field left-col">
          <div class="field-label"><zw-string>item.textblock</zw-string> ({{lang1}})</div>
          <quill v-model="model[lang1].value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
        <div class="translate">
          <el-button type="text" icon="el-icon-bottom" @click="doTranslate"></el-button>
        </div>
        <div class="field">
          <div class="field-label"><zw-string>item.textblock</zw-string> ({{lang2}})</div>
          <quill v-model="model[lang2].value" :options="quillOptions" ref="translation" v-loading="translating"></quill>
        </div>
      </template>
      <el-button class="save-button" type="primary" size="medium" @click="save">
        <zw-string>action.submit</zw-string>
      </el-button>
      <el-button size="medium" @click="cancel">
        <zw-string>action.cancel</zw-string>
      </el-button>
    </template>
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
    require('./mixins/cancel').default
  ],

  data () {
    return {
      type: 'zukunftswerk.textblock',
      saving: false                   // true while textblock is saved
    }
  },

  props: {

    topic: {                          // the Textblock topic to render (dmx.ViewTopic)
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

    textblock () {
      return {
        de: this.html('de'),
        fr: this.html('fr')
      }
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
      let action, arg, msgBox
      if (this.isNew) {
        action = 'createTextblock'
        arg = {
          topic: this.topic
        }
        msgBox = 'confirm'
      } else {
        action = 'update'
        arg = this.topic
        // transfer edit buffer to topic model
        this.setText('de')
        this.setText('fr')
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
      // Note: in a monolingual textblock "fr" is not defined
      const html = this.topic.children['zukunftswerk.textblock.' + lang]?.value
      if (html !== '<p><br></p>') {
        return html
      }
    },

    setText (lang) {
      // Note: in a monolingual textblock "fr" is not defined     // TODO: simplify
      if (!this.topic.children['zukunftswerk.textblock.fr']) {
        this.$set(this.topic.children, 'zukunftswerk.textblock.fr', {})
      }
      //
      const compDefUri = 'zukunftswerk.textblock.' + lang
      this.topic.children[compDefUri].value = this.model[lang].value
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
.zw-textblock {
  padding: 12px;
  background-color: var(--background-color);
}

.zw-textblock.info {
  display: flex;
}

.zw-textblock.info > div:nth-child(1) {
  padding-right: 20px;
  border-right: 2px dashed #f6f6f6;
}

.zw-textblock.info > div:nth-child(2) {
  padding-left: 20px;
}

.zw-textblock.form .translate {
  text-align: center;
  margin-top: 12px;
}

.zw-textblock.form .translate .el-button {
  font-size: 24px;
}

.zw-textblock.form .save-button {
  margin-top: var(--field-spacing);
}
</style>
