<template>
  <el-button class="zw-attachment" type="text" :disabled="!enabled" @click="download">
    <span class="icon fa fa-fw fa-paperclip"></span>
    <span class="file-name">{{fileName}}</span>
    <el-button class="close-button" v-if="closable" type="text" icon="el-icon-close" @click="remove"></el-button>
  </el-button>
</template>

<script>
export default {

  props: {
    file: {               // the attachment (File topic, plain Object)
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
      this.$store.dispatch('downloadFile', this.path)
    },

    remove () {
      this.$emit('remove', this.file)
    }
  }
}
</script>

<style>
.zw-attachment {
  display: block;
  margin-left: 0 !important;
}

.zw-attachment.is-disabled {
  color: var(--secondary-color);    /* Element UI Button default is #c0c4cc */
  cursor: unset !important;
}

.zw-attachment .file-name {
  font-size: var(--secondary-font-size);
}

.zw-attachment .icon {
  font-size: 16px;
}

.zw-attachment .close-button {
  font-size: 16px;
  visibility: hidden;
}

.zw-attachment:hover .close-button {
  visibility: visible;
}
</style>
