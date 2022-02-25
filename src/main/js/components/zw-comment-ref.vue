<template>
  <div class="zw-comment-ref" v-if="comment" @click="click">
    <div class="creator label">theo</div>
    <zw-truncate class="comment label" :html="html[lang]"></zw-truncate>
    <el-button class="close-button" v-if="removable" type="text" icon="el-icon-close" @click="remove"></el-button>
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
.zw-comment-ref {
  display: inline-block;
  position: relative;
  background-color: #fff6cc;
  border-left: 5px solid #ffd100;
  padding: 6px 6px 6px 10px;
  cursor: pointer;
}

.zw-comment-ref .creator {
  font-weight: bold;
  margin-bottom: 2px;
}

.zw-comment-ref .comment {
  font-style: italic;
}

.zw-comment-ref .close-button {
  font-size: 20px;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
