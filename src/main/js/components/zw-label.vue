<template>
  <div v-if="infoMode" class="zw-label info">{{label[lang]}}</div>
  <div v-else class="zw-label form" v-loading="saving">
    <div class="field-label">
      <zw-string>label.new_label</zw-string>
    </div>
    <el-input v-model="topic.value" ref="input"></el-input>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>global.submit</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mounted () {
    if (this.formMode) {
      this.$refs.input.focus()
    }
  },

  data () {
    return {
      saving: false           // true while label is saved
    }
  },

  props: {

    topic: {
      type: dmx.ViewTopic,    // the Label topic to render (dmx.ViewTopic)
      required: true
    },

    mode: {                   // 'info'/'form'
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

    infoMode () {
      return this.mode === 'info'
    },

    formMode () {
      return this.mode === 'form'
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {
    save () {
      this.saving = true
      this.$store.dispatch('createLabel', this.topic).then(() => {
        this.saving = false
      })
    }
  }
}
</script>

<style>
.zw-label.info {
  font-size: 24px;
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
  margin-top: 6px;
}
</style>
