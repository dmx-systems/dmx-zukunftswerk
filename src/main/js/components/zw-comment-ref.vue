<template>
  <el-button class="zw-comment-ref" v-if="comment" type="text" @click="click">
    <span class="fa fa-comment"></span>
    <zw-truncate :html="html[lang]"></zw-truncate>
  </el-button>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    comment: Object     // the referred to Comment, optional (plain Object, not a dmx.Topic)
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
      this.$emit('comment-ref-click', this.comment)
    }
  }
}
</script>

<style>
.zw-comment-ref {
  white-space: unset;     /* Element UI button default is "nowrap" */
  text-align: unset;      /* Element UI button default is "center" */
}
</style>
