<template>
  <div v-if="infoMode" class="zw-label info">{{label[lang]}}</div>
  <div v-else :class="['zw-label', 'form', {'new': isNew}]" v-loading="saving">
    <template v-if="isNew">
      <div class="field-label">
        <zw-string>label.new_label</zw-string>
      </div>
      <el-input v-model="topic.value" ref="input"></el-input>
    </template>
    <template v-else>
      <div class="field">
        <div class="field-label">
          <zw-string>item.label</zw-string> ({{origLang}})
        </div>
        <el-input v-model="labelModel[origLang].value" ref="input"></el-input>
      </div>
      <div class="field">
        <div class="field-label">
          <zw-string>item.label</zw-string> ({{translatedLang}})
        </div>
        <el-input v-model="labelModel[translatedLang].value"></el-input>
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
    require('./mixins/orig-lang').default,
    require('./mixins/cancel').default
  ],

  mounted () {
    if (this.formMode) {
      this.$refs.input.focus()      // FIXME
    }
  },

  data () {
    return {
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
        de: this.topic.children['zukunftswerk.label.de'].value,
        fr: this.topic.children['zukunftswerk.label.fr'].value
      }
    },

    labelModel () {
      return {
        de: this.topicBuffer.children['zukunftswerk.label.de'],
        fr: this.topicBuffer.children['zukunftswerk.label.fr']
      }
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
      let action
      if (this.isNew) {
        action = 'createLabel'
      } else {
        action = 'update'
        // transfer edit buffer to topic model
        this.setText('de')
        this.setText('fr')
      }
      this.$store.dispatch(action, this.topic).catch(() => {
        // silence browser console
      }).finally(() => {
        this.saving = false
      })
    },

    setText (lang) {
      const compDefUri = 'zukunftswerk.label.' + lang
      this.topic.children[compDefUri].value = this.labelModel[lang].value
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
</style>
