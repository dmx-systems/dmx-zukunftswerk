<template>
  <div class="zw-attachment">
    <el-button class="button" type="text" :disabled="!enabled" @click="download">
      <span class="fa fa-paperclip"></span>
      <span>{{fileName}}</span>
    </el-button>
    <el-button class="remove-button" v-if="removable" type="text" icon="el-icon-circle-close" @click="remove">
    </el-button>
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
    removable: Boolean    // if true the remove-button is rendered, optional
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
  position: relative;
}

.zw-attachment .button {
  white-space: unset;     /* Element UI button default is "nowrap" */
  text-align: unset;      /* Element UI button default is "center" */
}

.zw-attachment .button.is-disabled {
  color: var(--label-color);
}

.zw-attachment .remove-button {
  position: absolute;
  top: -3px;
  font-size: 20px;
  visibility: hidden;
}

.zw-attachment:hover .remove-button {
  visibility: visible;
}
</style>
