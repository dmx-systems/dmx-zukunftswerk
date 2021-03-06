<template>
  <div class="zw-note dmx-html-field info" v-if="infoMode" v-html="noteHtml" :style="style"></div>
  <div :class="['zw-note', 'dmx-html-field', 'form', {'new': isNew}]" v-else v-loading="saving" :style="style">
    <template v-if="isNew">
      <div class="field">
        <div class="field-label">
          <zw-string>label.new_note</zw-string>
        </div>
        <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
      </div>
    </template>
    <template v-else>
      <div class="field left-col">
        <div class="field-label">
          <zw-string>item.note</zw-string> ({{lang1}})
        </div>
        <quill v-model="model[lang1].value" :options="quillOptions" @quill-ready="focus" ref="quill">
        </quill>
        <el-button class="translate-button" type="text" @click="doTranslate">
          <zw-string>action.translate</zw-string>
        </el-button>
      </div>
      <div class="field">
        <div class="field-label">
          <zw-string>item.note</zw-string> ({{lang2}})
        </div>
        <quill v-model="model[lang2].value" :options="quillOptions" ref="translation" v-loading="translating">
        </quill>
      </div>
    </template>
    <div class="field">
      <div class="field-label">
        <zw-string>label.color</zw-string>
      </div>
      <el-dropdown size="medium" trigger="click" @command="setColor">
        <el-button type="text">
          <div class="color-box" :style="style"></div><!--
          --><span class="el-icon-arrow-down el-icon--right"></span>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(col, i) in colors" :command="col" :key="col">
            <div :class="colorBoxClass(col, i)" :style="{'background-color': col}"></div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>action.submit</zw-string>
    </el-button>
    <el-button size="medium" @click="cancel">
      <zw-string>action.cancel</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'
import zw from '../zw-globals'
import errorHandler from '../error-handler'

export default {

  created () {
    // console.log('zw-note', this.initColor)
    this.color = this.initColor
  },

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/translation').default
  ],

  data () {
    return {
      type: 'zukunftswerk.note',
      initColor: this.topic.viewProps['zukunftswerk.color'] || zw.NOTE_COLORS[1],     // gray
      color: undefined,               // selected color
      colors: zw.NOTE_COLORS,         // all colors
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

    style () {
      return {
        'background-color': this.color
      }
    },

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
      return this.note[this.noteLang]
    },

    isNew () {
      return !this.topic.id
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
        action = 'createNote'
        arg = {
          topic: this.topic
        }
        msgBox = 'confirm'
      } else {
        action = 'updateNote'
        arg = this.topic
        // transfer edit buffer to topic model
        this.setNote('de')
        this.setNote('fr')
      }
      this.topic.setViewProp('zukunftswerk.color', this.color)
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

    cancel () {
      this.color = this.initColor
      this.$store.dispatch('cancel', this.topic)
    },

    doTranslate () {
      this.translate().then(translation => {
        // Note: in case of translation error 'confirm' is passed (String)
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
    },

    setColor (color) {
      this.color = color
    },

    colorBoxClass (col, i) {
      const classes = ['color-box']
      if (i === 0 || i === 6) {
        classes.push(col)
      }
      return classes
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
  padding: 12px;
}

.zw-note.form .translate-button {
  position: absolute;
  visibility: hidden;
  margin-top: 1px;
}

.zw-note.form .left-col:hover .translate-button {
  visibility: visible;
}

.zw-note.form .el-icon-arrow-down {
  vertical-align: top;
}

.zw-note.form .color-box {
  display: inline-block;
  width: 40px;
  height: 30px;
  border: 1px dashed var(--highlight-color);
}

/* dropdown menus are body mounted */
body > .el-dropdown-menu .color-box {
  margin-top: 9px;
  width: 40px;
  height: 30px;
}

body > .el-dropdown-menu .color-box.white,
body > .el-dropdown-menu .color-box.transparent {
  border: 1px solid var(--border-color-lighter);
}

body > .el-dropdown-menu .color-box.transparent {
  background-image: url("../../resources-build/grid.png");
  background-position: bottom right;
  background-size: 12px;
}

.zw-note.form .save-button {
  margin-top: var(--field-spacing);
}
</style>
