<template>
  <div class="zw-comment-ref" v-if="comment">
    <el-button class="button" type="text" @click="click">
      <span class="fa fa-comment"></span>
      <zw-truncate :html="html[lang]"></zw-truncate>
    </el-button>
    <el-button class="remove-button" v-if="removable" type="text" icon="el-icon-circle-close" @click="remove">
    </el-button>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

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
      this.$emit('comment-ref-click', this.comment)
    },

    remove () {
      this.$emit('remove', this.comment)
    }
  }
}
</script>

<style>
.zw-comment-ref {
  position: relative;
}

.zw-comment-ref .button {
  white-space: unset;     /* Element UI button default is "nowrap" */
  text-align: unset;      /* Element UI button default is "center" */
}

.zw-comment-ref .remove-button {
  position: absolute;
  top: -3px;
  font-size: 20px;
  visibility: hidden;
}

.zw-comment-ref:hover .remove-button {
  visibility: visible;
}
</style>
