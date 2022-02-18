<template>
  <div class="zw-comment-ref" v-if="comment">
    <el-tag :closable="removable" size="medium" @click="click" @close="remove">
      <span class="fa fa-fw fa-comment"></span>
      <zw-truncate :html="html[lang]"></zw-truncate>
    </el-tag>
  </div>
</template>

<script>
export default {

  props: {
    comment: Object,      // the referred-to Comment, optional (plain Object, not a dmx.Topic)
    removable: Boolean    // if true the remove-button is rendered, optional
  },

  computed: {

    html () {
      return {
        de: this.comment.children['zukunftswerk.comment.de'].value,
        fr: this.comment.children['zukunftswerk.comment.fr'].value
      }
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    click () {
      this.$emit('click', this.comment)
    },

    remove () {
      this.$emit('remove', this.comment)
    }
  }
}
</script>

<style>
.zw-comment-ref .el-tag {
  cursor: pointer;
  height: unset;                  /* Element UI Tag default is 32px; not suitable for multi-line tags */
  line-height: unset;             /* Element UI Tag default is 30px */
  white-space: unset;             /* Element UI Tag default is "nowrap" */
  padding: 5px 10px 5px 10px;     /* Element UI Tag default is "0 10px" */
}
</style>
