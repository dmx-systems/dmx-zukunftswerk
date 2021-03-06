<template>
  <div v-if="infoMode" class="zw-label info">{{labelText}}</div>
  <div v-else :class="['zw-label', 'form', {'new': isNew}]" v-loading="saving">
    <template v-if="isNew">
      <div class="field-label">
        <zw-string>label.new_label</zw-string>
      </div>
      <el-input v-model="topic.value" ref="input"></el-input>
    </template>
    <template v-else>
      <div class="field left-col">
        <div class="field-label">
          <zw-string>item.label</zw-string> ({{lang1}})
        </div>
        <el-input v-model="model[lang1].value" ref="input"></el-input>
        <el-button class="translate-button" type="text" @click="translate">
          <zw-string>action.translate</zw-string>
        </el-button>
      </div>
      <div class="field">
        <div class="field-label">
          <zw-string>item.label</zw-string> ({{lang2}})
        </div>
        <el-input v-model="model[lang2].value" v-loading="translating"></el-input>
      </div>
    </template>
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

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/translation').default,
    require('./mixins/cancel').default
  ],

  mounted () {
    if (this.formMode) {
      this.$refs.input.focus()      // FIXME
    }
  },

  data () {
    return {
      type: 'zukunftswerk.label',
      saving: false                 // true while label is saved
    }
  },

  props: {

    topic: {                        // the Label topic to render (dmx.ViewTopic)
      type: dmx.ViewTopic,
      required: true
    },

    topicBuffer: dmx.ViewTopic,     // the edit buffer (dmx.ViewTopic)

    mode: {                         // 'info'/'form'
      type: String,
      default: 'info'
    }
  },

  computed: {

    label () {
      return {
        // Note: in a monolingual label "fr" is not defined
        de: this.topic.children['zukunftswerk.label.de'].value,
        fr: this.topic.children['zukunftswerk.label.fr']?.value
      }
    },

    labelLang () {
      if (this.label.de && this.label.fr) {
        return this.lang
      } else if (this.label.de) {
        return 'de'
      } else if (this.label.fr) {
        return 'fr'
      }
    },

    labelText () {
      return this.label[this.labelLang]
    },

    isNew () {
      return !this.topic.id
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    save () {
      this.saving = true
      let action, arg, msgBox
      if (this.isNew) {
        action = 'createLabel'
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

    setText (lang) {
      // Note: in a monolingual label "fr" is not defined     // TODO: simplify
      if (!this.topic.children['zukunftswerk.label.fr']) {
        this.$set(this.topic.children, 'zukunftswerk.label.fr', {})
      }
      //
      const compDefUri = 'zukunftswerk.label.' + lang
      this.topic.children[compDefUri].value = this.model[lang].value
    }
  }
}
</script>

<style>
.zw-label.info {
  font-size: 32px;
  font-weight: bold;
}

.zw-label.form {
  padding: 10px;
  border: 1px solid var(--border-color-lighter);
}

.zw-label.form .el-input {
  font-size: 24px;
}

.zw-label.form .save-button {
  margin-top: var(--field-spacing);
}

.zw-label.form.new .save-button {
  margin-top: 6px;
}

.zw-label.form .translate-button {
  position: absolute;
  display: block;
  visibility: hidden;
  margin-top: 1px;
}

.zw-label.form .left-col:hover .translate-button {
  visibility: visible;
}
</style>
