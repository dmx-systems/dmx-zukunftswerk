<template>
  <div v-if="infoMode" class="zw-label info">{{label[lang]}}</div>
  <div v-else class="zw-label form" v-loading="saving">
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
        <el-input v-model="labelBuffer[origLang].value" ref="input"></el-input>
      </div>
      <div class="field">
        <div class="field-label">
          <zw-string>item.label</zw-string> ({{translatedLang}})
        </div>
        <el-input v-model="labelBuffer[translatedLang].value"></el-input>
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

    labelBuffer () {
      return {
        de: this.textBuffer('de'),
        fr: this.textBuffer('fr')
      }
    },

    infoMode () {
      return this.mode === 'info'
    },

    formMode () {
      return this.mode === 'form'
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
      let p
      if (this.isNew) {
        p = this.$store.dispatch('createLabel', this.topic)
      } else {
        // transfer edit buffer to topic model
        this.setText('de')
        this.setText('fr')
        //
        p = this.$store.dispatch('update', this.topic)
      }
      p.then(() => {
        this.saving = false
      })
    },

    textBuffer (lang) {
      return this.topicBuffer.children['zukunftswerk.label.' + lang]
    },

    setText (lang) {
      const compDefUri = 'zukunftswerk.label.' + lang
      this.topic.children[compDefUri].value = this.labelBuffer[lang].value
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

.zw-label .el-input {
  font-size: 24px;
}

.zw-label .save-button {
  margin-top: var(--field-spacing);
}
</style>
