<template>
  <el-dialog custom-class="zw-upload-dialog" :visible="visible" :modal="false" @open="clearError" @close="close">
    <el-upload drag :action="action" :on-success="onSuccess" :on-error="onError" ref="upload"></el-upload>
    <div class="error">{{error}}</div>
  </el-dialog>
</template>

<script>
import dmx from 'dmx-api'

export default {

  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      error: ''
    }
  },

  computed: {
    action () {
      return '/upload/' + encodeURIComponent('/')
    }
  },

  methods: {

    onSuccess (response, file, fileList) {
      // TODO
      // this.$store.dispatch('revealRelatedTopic', {relTopic: new dmx.RelatedTopic(response.topic)})
      this.$refs.upload.clearFiles()
      this.close()
    },

    onError (error, file, fileList) {
      this.error = `${error.name}: ${error.message}`
    },

    clearError () {
      this.error = ''
    },

    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.zw-upload-dialog .error {
  color: var(--color-danger);
  margin-top: var(--field-spacing);
}
</style>
