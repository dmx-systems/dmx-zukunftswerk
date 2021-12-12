<template>
  <el-button class="zw-attachment" type="text" @click="download">
    <span class="fa fa-paperclip"></span>
    <span>{{fileName}}</span>
  </el-button>
</template>

<script>
export default {

  props: {
    file: {   // the attachment (File topic, plain Object)
      type: Object,
      required: true
    }
  },

  computed: {

    fileName () {
      return this.file.children['dmx.files.file_name'].value
    },

    path () {
      return this.file.children['dmx.files.path'].value
    }
  },

  methods: {
    download () {
      this.$store.dispatch('downloadFile', this.path)
    }
  }
}
</script>

<style>
.zw-attachment {
  white-space: unset;     /* Element UI button default is "nowrap" */
  text-align: unset;      /* Element UI button default is "center" */
}
</style>
