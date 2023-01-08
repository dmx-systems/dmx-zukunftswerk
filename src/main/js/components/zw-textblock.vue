<template>
  <div :class="['zw-textblock', 'dmx-html-field', {'filter': isFiltered}, mode]" v-loading="saving" :style="style">
    <template v-if="infoMode">
      <div class="discussion-button" :style="style">
        <el-button type="text" icon="el-icon-chat-round" @click="setRefTextblock"></el-button>
      </div>
      <div class="text1" v-html="textblock[lang1]"></div>
      <div class="text2" v-html="textblock[lang2]"></div>
    </template>
    <template v-else>
      <template v-if="isNew">
        <div class="field">
          <div class="field-label"><zw-string>label.new_textblock</zw-string></div>
          <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
      </template>
      <template v-else>
        <div class="texts">
          <div class="field">
            <div class="field-label"><zw-string>item.textblock</zw-string> ({{lang1}})</div>
            <quill v-model="model[lang1].value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
          </div>
          <el-button class="translate" type="text" icon="el-icon-right" @click="doTranslate"></el-button>
          <div class="field">
            <div class="field-label"><zw-string>item.textblock</zw-string> ({{lang2}})</div>
            <quill v-model="model[lang2].value" :options="quillOptions" ref="translation" v-loading="translating">
            </quill>
          </div>
        </div>
      </template>
      <zw-color-selector v-model="selectedColor"></zw-color-selector>
      <el-button class="save-button" type="primary" size="medium" @click="save">
        <zw-string>action.submit</zw-string>
      </el-button>
      <el-button size="medium" @click="doCancel">
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
    require('./mixins/color-selector').default
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

    style () {
      if (this.infoMode) {
        return {
          'background-color': this.color
        }
      }
    },

    // TODO: factor out as a mixin? Copies in zw-label.vue, zw-document.vue, zw-textblock.vue
    isNew () {
      return this.topic.id < 0
    },

    isFiltered () {
      return this.refTextblock?.id === this.topic.id
    },

    refTextblock () {
      return this.$store.state.refTextblock
    },

    quillOptions () {
      return zw.quillOptions
    }
  },

  methods: {

    focus () {
      this.$refs.quill.focus()
    },

    setRefTextblock () {
      this.$store.dispatch('setRefTextblock', this.topic)
    },

    save () {
      this.saving = true
      this.topic.setViewProp('zukunftswerk.color', this.selectedColor)            // persistence
      this.topic.children['zukunftswerk.color'] = {value: this.selectedColor}     // view
      let action, arg, msgBox
      if (this.isNew) {
        action = 'createTextblock'
        arg = {
          topic: this.topic
        }
        msgBox = 'confirm'
      } else {
        action = 'updateAndStoreColor'
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
    'zw-color-selector': require('./zw-color-selector').default,
    quill: () => ({
      component: import('vue-quill-minimum' /* webpackChunkName: "vue-quill-minimum" */),
      loading: require('./zw-spinner')
    })
  }
}
</script>

<style>
.zw-textblock {
  padding: 6px;
  border: var(--filter-border);
}

.zw-textblock.filter {
  border-color: var(--primary-color);
}

.zw-textblock.filter .discussion-button {
  border-color: var(--primary-color);
}

.zw-textblock.info {
  display: flex;
}

.zw-textblock.info > .text1 {
  padding-right: 20px;
  border-right: 2px dashed #f6f6f6;
}

.zw-textblock.info > .text2 {
  padding-left: 20px;
}

.zw-textblock.form {
  background-color: var(--background-color);
}

.zw-textblock.form .texts {
  display: flex;
  align-items: center;
}

.zw-textblock.form .texts .field {
  flex: 1 1 50%;
}

.zw-textblock.form .el-button.translate {
  font-size: 24px;
  margin: 0 8px;
}

.zw-textblock.form .zw-color-selector {
  margin-top: var(--field-spacing);
}

.zw-textblock.form .save-button {
  margin-top: var(--field-spacing);
}

/* discussion button */

.zw-textblock .discussion-button {
  position: absolute;
  top: 0;
  right: -34px;
  padding: 2px 2px 2px 12px;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  border-top: var(--filter-border);
  border-right: var(--filter-border);
  border-bottom: var(--filter-border);
}

.zw-textblock .discussion-button .el-button {
  font-size: 18px;
}
</style>
