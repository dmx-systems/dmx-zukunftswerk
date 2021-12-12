<template>
  <el-button class="zw-attachment" type="text" @click="download">
    <span class="fa fa-paperclip"></span>
    <span>{{path}}</span>
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
    path () {
      return this.file.value    // TODO
    }
  },

  methods: {
    download () {
      // TODO
      // this.$emit('comment-ref-click', this.comment)
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
