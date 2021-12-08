<template>
  <div v-if="infoMode" class="zw-label info">{{label[lang]}}</div>
  <div v-else class="zw-label dmx-html-field form" v-loading="saving">
    <div class="field-label">
      <zw-string>note.new_note</zw-string>
    </div>
    <quill v-model="topic.value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
    <el-button class="save-button" type="primary" size="medium" @click="save">
      <zw-string>global.submit</zw-string>
    </el-button>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  data () {
    return {
      saving: false           // true while label is saved
    }
  },

  props: {

    topic: {
      type: dmx.ViewTopic,    // the Label topic (dmx.ViewTopic)
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
      this.$store.dispatch('createLabel', this.topic).then(() => {
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
.zw-label.info {
  font-size: 24px;
  font-weight: bold;
}

.zw-label.form {
}

.zw-label .save-button {
  margin-top: 6px;
}
</style>
