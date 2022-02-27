<template>
  <div :class="['zw-attachment', {enabled}]">
    <el-tag :closable="closable" size="medium" @click="download" @close="remove">
      <span class="fa fa-fw fa-paperclip"></span>
      <span>{{fileName}}</span>
    </el-tag>
  </div>
</template>

<script>
export default {

  props: {
    file: {   // the attachment (File topic, plain Object)
      type: Object,
      required: true
    },
    enabled: Boolean,
    closable: Boolean     // if true the close-button is rendered, optional
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
      if (this.enabled) {
        this.$store.dispatch('downloadFile', this.path)
      }
    },

    remove () {
      this.$emit('remove', this.file)
    }
  }
}
</script>

<style>
.zw-attachment .el-tag {
  height: unset;                  /* Element UI Tag default is 32px; not suitable for multi-line tags */
  line-height: unset;             /* Element UI Tag default is 30px */
  white-space: unset;             /* Element UI Tag default is "nowrap" */
  padding: 5px 10px 5px 10px;     /* Element UI Tag default is "0 10px" */
}

.zw-attachment.enabled .el-tag {
  cursor: pointer;
}
</style>
