<template>
  <el-button class="zw-comment-ref" v-if="comment" type="text">
    <span class="fa fa-comment"></span>
    <zw-truncate :html="commentHtml[lang]"></zw-truncate>
  </el-button>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    comment: Object     // the Comment to render, optional (plain Object, not a dmx.Topic)
  },

  computed: {

    commentHtml () {
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
    reply () {
      this.$emit('reply', this.comment)
    }
  }
}
</script>

<style>
.zw-comment-ref {
  white-space: unset;     /* Element UI default is "nowrap" */
  text-align: unset;      /* Element UI default is "center" */
}
</style>
